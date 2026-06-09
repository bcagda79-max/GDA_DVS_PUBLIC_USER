import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOfficerContextByUserId } from "@/lib/officer-access";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const officerId = String(body.officerId ?? "").trim();
    const adminUserId = String(body.adminUserId ?? "").trim();

    if (!officerId || !adminUserId) {
      return NextResponse.json({ error: "officerId and adminUserId are required." }, { status: 400 });
    }

    const ctx = await getOfficerContextByUserId(adminUserId);
    if (!ctx?.isAdmin) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    await db.query(
      `UPDATE officers SET approved = false, rejected = true, rejected_at = NOW(), rejected_by = $1 WHERE id = $2`,
      [adminUserId, officerId],
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const message = err instanceof Error ? err.message : "Failed to reject officer.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
