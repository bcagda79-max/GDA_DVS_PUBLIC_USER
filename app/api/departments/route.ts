import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Built-in departments always available */
const BUILTIN_DEPARTMENTS = [
  "BCA",
  "Administration",
  "Technical",
  "Tourism",
  "Accounts",
];

/**
 * GET /api/departments
 * Returns the merged list of built-in + custom departments saved in DB.
 */
export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      // Fallback to built-ins only if admin client not available
      return NextResponse.json({ departments: BUILTIN_DEPARTMENTS });
    }

    const { data, error } = await supabaseAdmin
      .from("departments")
      .select("name")
      .order("name", { ascending: true });

    if (error) {
      // Non-fatal — return built-ins only
      console.error("Failed to fetch departments:", error);
      return NextResponse.json({ departments: BUILTIN_DEPARTMENTS });
    }

    const custom: string[] = (data ?? []).map((r: { name: string }) => r.name);

    // Merge built-ins first, then custom (deduplicated)
    const all = [
      ...BUILTIN_DEPARTMENTS,
      ...custom.filter((d) => !BUILTIN_DEPARTMENTS.includes(d)),
    ];

    return NextResponse.json({ departments: all });
  } catch (e) {
    console.error("GET /api/departments error:", e);
    return NextResponse.json({ departments: BUILTIN_DEPARTMENTS });
  }
}
