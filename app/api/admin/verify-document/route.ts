import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOfficerContextByUserId } from "@/lib/officer-access";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const documentId = String(body.documentId || "").trim();
    const adminUserId = String(body.adminUserId || "").trim();

    if (!documentId || !adminUserId) {
      return NextResponse.json({ error: "documentId and adminUserId required" }, { status: 400 });
    }

    const ctx = await getOfficerContextByUserId(adminUserId);
    if (!ctx?.isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await db.query(
      `UPDATE documents SET verified = true, verified_by = $1, verified_at = NOW() WHERE id = $2`,
      [adminUserId, documentId],
    );

    return NextResponse.json({ ok: true, documentId });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
