import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getDocumentFileUrl } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const documentId = url.searchParams.get("id")?.trim().toUpperCase().replace(/\s+/g, "-");

  if (!documentId) {
    return NextResponse.json({ error: "Document ID is required." }, { status: 400 });
  }

  try {
    const result = await db.query(
      `SELECT id, department, title, recipient_name, issue_date, expiry_date, storage_path, mime_type, file_size, processed_file_name, verified
       FROM documents
       WHERE id = $1
       LIMIT 1`,
      [documentId],
    );

    const document = result.rows[0];
    if (!document || !document.verified) {
      return NextResponse.json({ status: "invalid" });
    }

    return NextResponse.json({
      status: "authentic",
      documentId: document.id,
      title: document.title,
      department: document.department,
      recipient: document.recipient_name,
      issueDate: document.issue_date,
      expiryDate: document.expiry_date ?? "No Expiry",
      fileName: document.processed_file_name,
      storagePath: document.storage_path,
      fileUrl: document.storage_path ? getDocumentFileUrl(document.storage_path) : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? String(error) }, { status: 500 });
  }
}