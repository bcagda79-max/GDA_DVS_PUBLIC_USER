import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getOfficerContextByUserId } from "@/lib/officer-access";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 });
    }

    // 1. Verify user is Admin
    const ctx = await getOfficerContextByUserId(userId);
    if (!ctx?.isAdmin) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    // 2. Fetch only verified documents for the vault
    const { data: documents, error: docsError } = await supabase
      .from("documents")
      .select("*")
      .eq("verified", true)
      .order("created_at", { ascending: false });

    if (docsError) {
      throw docsError;
    }

    return NextResponse.json({ documents: documents ?? [] }, { status: 200 });
  } catch (error: any) {
    console.error("Vault Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve documents." },
      { status: 500 }
    );
  }
}
