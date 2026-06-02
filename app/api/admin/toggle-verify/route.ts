import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
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

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Missing Supabase env" }, { status: 500 });
    }

    const updatePayload = {
      verified: verifyStatus,
      verified_by: verifyStatus ? userId : null,
      verified_at: verifyStatus ? new Date().toISOString() : null,
    };

    const { error } = await (supabaseAdmin.from("documents") as any)
      .update(updatePayload)
      .eq("id", documentId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true, documentId, verified: verifyStatus });
  } catch (err: any) {
    console.error("toggle-verify API error:", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
