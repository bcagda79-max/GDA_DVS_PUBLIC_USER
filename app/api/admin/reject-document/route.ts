import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deleteDocumentFile } from "@/lib/storage";
import { getOfficerContextByUserId } from "@/lib/officer-access";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { userId, documentId } = await request.json();

    if (!userId || !documentId) {
      return NextResponse.json({ error: "userId and documentId are required" }, { status: 400 });
    }

    const ctx = await getOfficerContextByUserId(userId);
    if (!ctx?.isAdmin) {
      return NextResponse.json({ error: "Not authorized. Super Admin only." }, { status: 403 });
    }

    const result = await db.query(
      `SELECT storage_path FROM documents WHERE id = $1 LIMIT 1`,
      [documentId],
    );

    const docRecord = result.rows[0];
    if (docRecord?.storage_path) {
      await deleteDocumentFile(docRecord.storage_path);
    }

    await db.query(`DELETE FROM documents WHERE id = $1`, [documentId]);

    return NextResponse.json({ ok: true, documentId });
  } catch (err: any) {
    console.error("reject-document API error:", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
