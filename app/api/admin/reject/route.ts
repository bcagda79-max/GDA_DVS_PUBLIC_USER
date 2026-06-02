import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const officerId = String(body.officerId ?? "").trim();
    const adminUserId = String(body.adminUserId ?? "").trim();

    if (!officerId || !adminUserId) {
      return NextResponse.json({ error: "officerId and adminUserId are required." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Missing Supabase admin client." }, { status: 500 });
    }

    // verify caller is admin
    const { data: adminOfficer } = await (supabaseAdmin.from("officers") as any)
      .select("user_id, role")
      .eq("user_id", adminUserId)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminOfficer) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    // Try to set rejected flags; if columns missing, fallback to clearing approved only
    const updatePayload = {
      rejected: true,
      rejected_at: new Date().toISOString(),
      rejected_by: adminUserId,
      approved: false,
    } as any;

    const { error } = await (supabaseAdmin.from("officers") as any)
      .update(updatePayload)
      .eq("id", officerId);

    if (error) {
      // If rejected column doesn't exist, fallback to minimal update
      if (error?.message && String(error.message).toLowerCase().includes("rejected")) {
        const { error: err2 } = await (supabaseAdmin.from("officers") as any)
          .update({ approved: false })
          .eq("id", officerId);
        if (err2) return NextResponse.json({ error: err2.message }, { status: 500 });
        return NextResponse.json({ ok: true, fallback: true });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to reject officer.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
