import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOfficerContextByUserId } from "@/lib/officer-access";
import { getDocumentFileUrl } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = String(url.searchParams.get("userId") || "").trim();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const ctx = await getOfficerContextByUserId(userId);
    if (!ctx?.isAdmin) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

    const result = await db.query(
      `SELECT id, department, title, recipient_name, issue_date, expiry_date, storage_path, processed_file_name, created_at
       FROM documents
       WHERE verified = false AND (is_forwarded = true OR processed_by = $1)
       ORDER BY created_at DESC`,
      [userId],
    );

    const pending = result.rows.map((d: any) => ({
      ...d,
      fileUrl: d.storage_path ? getDocumentFileUrl(d.storage_path) : null,
    }));

    return NextResponse.json({ pending });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
