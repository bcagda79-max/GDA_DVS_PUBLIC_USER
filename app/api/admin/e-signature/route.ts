import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOfficerContextByUserId } from "@/lib/officer-access";
import { saveDocumentFile } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const adminUserId = String(formData.get("adminUserId") || "").trim();
    const documentId = String(formData.get("documentId") || "").trim();
    const signedPdf = formData.get("signedPdf");

    if (!adminUserId || !documentId || !(signedPdf instanceof File)) {
      return NextResponse.json({ error: "adminUserId, documentId, and signedPdf are required." }, { status: 400 });
    }

    const ctx = await getOfficerContextByUserId(adminUserId);
    if (!ctx?.isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const result = await db.query(
      `SELECT storage_path FROM documents WHERE id = $1 LIMIT 1`,
      [documentId],
    );

    const docRecord = result.rows[0];
    if (!docRecord?.storage_path) {
      return NextResponse.json({ error: "Document not found or missing storage path." }, { status: 404 });
    }

    const storagePath = docRecord.storage_path;
    const pdfBuffer = Buffer.from(await signedPdf.arrayBuffer());

    await saveDocumentFile(storagePath, pdfBuffer);

    await db.query(
      `UPDATE documents SET verified = true, verified_by = $1, verified_at = NOW(), mime_type = 'application/pdf', file_size = $2 WHERE id = $3`,
      [adminUserId, pdfBuffer.length, documentId],
    );

    return NextResponse.json({ ok: true, documentId });
  } catch (err: any) {
    console.error("e-signature API error:", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
