import { NextResponse } from "next/server";
import {
  stampUploadedDocument,
  type Department,
} from "@/lib/document-processing";
import { db } from "@/lib/db";
import { getOfficerContextByUserId } from "@/lib/officer-access";
import { saveDocumentFile } from "@/lib/storage";

export const runtime = "nodejs";

const defaultDepartment = "BCA";

/** Persist a new custom department name if it's not a built-in */
async function saveCustomDepartmentIfNew(name: string) {
  try {
    const builtins = ["BCA", "Administration", "Technical", "Tourism", "Accounts", "Admin", "General"];
    if (builtins.includes(name)) return;
    await db.query(`INSERT INTO departments (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`, [name]);
  } catch (e) {
    console.error("Failed to save custom department:", e);
  }
}

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
    const department = typeof departmentValue === "string" && departmentValue.trim()
      ? departmentValue.trim()
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
    await saveCustomDepartmentIfNew(department);

    const originalFileName = uploadedFile.name;
    const processedPath = buildStoragePath(result.documentId, result.fileName);

    await saveDocumentFile(processedPath, Buffer.from(result.buffer));
    await saveDocumentFile(`${result.documentId}/gdavs-barcode.png`, Buffer.from(result.barcodeBuffer));

    const title = String(formData.get("title") ?? "");
    const recipientName = String(formData.get("recipientName") ?? "");
    const issueDate = String(formData.get("issueDate") ?? "");
    const expiryDate = String(formData.get("expiryDate") ?? "");

    const insertValues = [
      result.documentId,
      department,
      title || null,
      recipientName || null,
      issueDate || null,
      expiryDate || null,
      processedPath,
      result.contentType,
      result.buffer.byteLength,
      originalFileName,
      result.fileName,
      processedBy,
      false,
      false,
    ];

    try {
      await db.query(
        `INSERT INTO documents (id, department, title, recipient_name, issue_date, expiry_date, storage_path, mime_type, file_size, original_file_name, processed_file_name, processed_by, verified, is_forwarded)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        insertValues,
      );
    } catch (insertError: any) {
      const message = String(insertError?.message || "").toLowerCase();
      if (message.includes("verified") || message.includes("is_forwarded")) {
        await db.query(
          `INSERT INTO documents (id, department, title, recipient_name, issue_date, expiry_date, storage_path, mime_type, file_size, original_file_name, processed_file_name, processed_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          insertValues.slice(0, 12),
        );
      } else {
        throw insertError;
      }
    }

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

    return NextResponse.json({
      documentId: result.documentId,
      storagePath: processedPath,
      message: "Document indexed. Awaiting admin verification.",
    });
  } catch (error) {
    try {
      console.error("/api/generate error:", error instanceof Error ? error.stack || error.message : error);
    } catch (e) {
      // ignore logging failures
    }

    const message = error instanceof Error ? error.message : "Failed to stamp the document.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
