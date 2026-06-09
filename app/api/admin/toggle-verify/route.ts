import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOfficerContextByUserId } from "@/lib/officer-access";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { userId, documentId, verifyStatus } = await request.json();
    
    if (!userId || !documentId || typeof verifyStatus !== "boolean") {
      return NextResponse.json({ error: "userId, documentId, and verifyStatus are required" }, { status: 400 });
    }

    const ctx = await getOfficerContextByUserId(userId);
    if (!ctx?.isAdmin) {
      return NextResponse.json({ error: "Not authorized. Super Admin only." }, { status: 403 });
    }

    await db.query(
      `UPDATE documents SET verified = $1, verified_by = $2, verified_at = $3 WHERE id = $4`,
      [verifyStatus, verifyStatus ? userId : null, verifyStatus ? new Date().toISOString() : null, documentId],
    );

    return NextResponse.json({ ok: true, documentId, verified: verifyStatus });
  } catch (err: any) {
    console.error("toggle-verify API error:", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
