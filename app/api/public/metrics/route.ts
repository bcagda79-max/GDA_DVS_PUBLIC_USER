import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) return NextResponse.json({ error: "Missing Supabase admin client." }, { status: 500 });

  try {
    const { count: totalDocuments } = await (supabaseAdmin.from("documents") as any).select("id", { count: "exact", head: true });

    // Departments are currently a known set in the system; return 7 as requested.
    const departmentsCount = 7;

    return NextResponse.json({ totalDocuments: totalDocuments ?? 0, departmentsCount });
  } catch (e) {
    return NextResponse.json({ totalDocuments: 0, departmentsCount: 6 });
  }
}
