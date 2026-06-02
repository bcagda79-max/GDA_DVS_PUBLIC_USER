import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getOfficerContextByUserId } from "@/lib/officer-access";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const documentId = String(body.documentId || "").trim();
    const adminUserId = String(body.adminUserId || "").trim();

    if (!documentId || !adminUserId) return NextResponse.json({ error: "documentId and adminUserId required" }, { status: 400 });

    const ctx = await getOfficerContextByUserId(adminUserId);
    if (!ctx?.isAdmin) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) return NextResponse.json({ error: "Missing Supabase env" }, { status: 500 });

    const { error } = await (supabaseAdmin.from("documents") as any).update({ verified: true, verified_by: adminUserId, verified_at: new Date().toISOString() }).eq("id", documentId);
    if (error) throw error;

    return NextResponse.json({ ok: true, documentId });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
