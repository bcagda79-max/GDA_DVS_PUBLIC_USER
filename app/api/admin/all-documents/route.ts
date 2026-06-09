import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOfficerContextByUserId } from "@/lib/officer-access";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const ctx = await getOfficerContextByUserId(userId);
    if (!ctx?.isAdmin) {
      return NextResponse.json({ error: "Not authorized. Super Admin only." }, { status: 403 });
    }

    const result = await db.query(`SELECT * FROM documents ORDER BY created_at DESC`);
    return NextResponse.json({ documents: result.rows || [] });
  } catch (err: any) {
    console.error("all-documents API error:", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
