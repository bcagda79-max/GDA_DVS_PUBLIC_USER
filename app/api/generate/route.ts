import { NextResponse } from "next/server";
import {
  stampUploadedDocument,
  type Department,
} from "@/lib/document-processing";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getOfficerContextByUserId } from "@/lib/officer-access";

export const runtime = "nodejs";

const defaultDepartment: Department = "BCA";
const barcodeBucket = "documents";

const validDepartments: Record<Department, true> = {
  BCA: true,
  Admin: true,
  Administration: true,
  Technical: true,
  Tourism: true,
  Accounts: true,
  General: true,
};

const buildStoragePath = (documentId: string, fileName: string) => {
  const extension = fileName.toLowerCase().endsWith(".pdf") ? "pdf" : "docx";
  return `${documentId}/${fileName.replace(/\.[^.]+$/, "")}.${extension}`;
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const uploadedFile = formData.get("file");

    if (!(uploadedFile instanceof File)) {
      return NextResponse.json({ error: "Please upload a PDF or DOCX file." }, { status: 400 });
    }

    const departmentValue = formData.get("department");
    const department =
      typeof departmentValue === "string" && departmentValue in validDepartments
        ? (departmentValue as Department)
        : defaultDepartment;

    const processedBy = String(formData.get("processedBy") ?? "").trim();

    if (!processedBy) {
      return NextResponse.json({ error: "Officer authorization is required." }, { status: 401 });
    }

    const officerContext = await getOfficerContextByUserId(processedBy);

    if (!officerContext || (!officerContext.canGenerate && !officerContext.isAdmin)) {
      return NextResponse.json({ error: "You are not approved to generate documents yet." }, { status: 403 });
    }

    const result = await stampUploadedDocument(uploadedFile, department);
    const supabaseAdmin = getSupabaseAdmin();

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Missing Supabase environment variables." },
        { status: 500 },
      );
    }

    // Store the full processed file in Supabase storage so the complete
    // stamped document can be retrieved later (admin-only download).
    const originalFileName = uploadedFile.name;
    const processedPath = buildStoragePath(result.documentId, result.fileName);

    const { error: uploadProcessedError } = await supabaseAdmin.storage
      .from(barcodeBucket)
      .upload(processedPath, Buffer.from(result.buffer), {
        contentType: result.contentType,
        upsert: false,
      });

    if (uploadProcessedError) {
      throw uploadProcessedError;
    }

    // Also keep the barcode image in storage for quick reference if desired.
    const barcodePath = `${result.documentId}/gdavs-barcode.png`;
    const { error: uploadBarcodeError } = await supabaseAdmin.storage
      .from(barcodeBucket)
      .upload(barcodePath, Buffer.from(result.barcodeBuffer), {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadBarcodeError) {
      throw uploadBarcodeError;
    }
    const title = String(formData.get("title") ?? "");
    const recipientName = String(formData.get("recipientName") ?? "");
    const issueDate = String(formData.get("issueDate") ?? "");
    const expiryDate = String(formData.get("expiryDate") ?? "");


    const documentsTable = supabaseAdmin.from("documents") as any;

    const payloadWithFlags = {
      id: result.documentId,
      department,
      title,
      recipient_name: recipientName,
      issue_date: issueDate || null,
      expiry_date: expiryDate || null,
      // store the processed file path (the full stamped document)
      storage_path: processedPath,
      mime_type: result.contentType,
      file_size: result.buffer.byteLength,
      original_file_name: originalFileName,
      processed_file_name: result.fileName,
      processed_by: processedBy,
      verified: false,
      is_forwarded: false,
    };

    let { error: insertError } = await documentsTable.insert(payloadWithFlags);

    // If insert failed due to schema cache (missing columns from migration),
    // retry without the new fields so stamping still works until the DB is migrated.
    if (insertError) {
      const msg = String(insertError.message || insertError).toLowerCase();
      const code = (insertError as any)?.code;
      if (msg.includes("could not find") || msg.includes("is_forwarded") || msg.includes("verified") || code === "PGRST204") {
        const payloadFallback: any = { ...payloadWithFlags };
        delete payloadFallback.verified;
        delete payloadFallback.is_forwarded;

        const { error: fallbackError } = await documentsTable.insert(payloadFallback);
        if (fallbackError) {
          throw fallbackError;
        }
      } else {
        throw insertError;
      }
    }

    // If the requester is an admin, return the file directly for download.
    if (officerContext.isAdmin) {
      return new NextResponse(Buffer.from(result.buffer), {
        status: 200,
        headers: {
          "Content-Type": result.contentType,
          "Content-Disposition": `attachment; filename="${result.fileName}"`,
          "X-Document-Id": result.documentId,
          "X-Output-Name": result.fileName,
          "X-Storage-Path": processedPath,
        },
      });
    }

    // For regular officers, do not return the file. Provide the document id,
    // storage path and a short-lived signed URL so the officer can preview
    // the processed (stamped) document in the UI without exposing a
    // permanent public link. Signed URL expires in 5 minutes.
    let signedUrl: string | null = null;
    try {
      const { data: signedData, error: signedError } = await supabaseAdmin.storage
        .from(barcodeBucket)
        .createSignedUrl(processedPath, 300);

      if (!signedError && signedData?.signedUrl) {
        signedUrl = signedData.signedUrl;
      }
    } catch (e) {
      // Non-fatal: preview will simply not be available if signed URL fails.
      // eslint-disable-next-line no-console
      console.error("Failed to create signed URL for preview:", e);
    }

    return NextResponse.json({
      documentId: result.documentId,
      storagePath: processedPath,
      signedUrl,
      message: "Document indexed. Awaiting admin verification.",
    });
  } catch (error) {
    // Log the full error and stack to the server terminal for debugging
    try {
      // eslint-disable-next-line no-console
      console.error("/api/generate error:", error instanceof Error ? error.stack || error.message : error);
    } catch (e) {
      // ignore logging failures
    }

    const message = error instanceof Error ? error.message : "Failed to stamp the document.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
