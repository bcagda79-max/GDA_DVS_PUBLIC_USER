import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getOfficerContextByUserId } from "@/lib/officer-access";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { userId, documentId } = await request.json();

    if (!userId || !documentId) {
      return NextResponse.json({ error: "userId and documentId are required" }, { status: 400 });
    }

    const ctx = await getOfficerContextByUserId(userId);
    if (!ctx?.isAdmin) {
      return NextResponse.json({ error: "Not authorized. Super Admin only." }, { status: 403 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Missing Supabase env" }, { status: 500 });
    }

    // Fetch the document to get the storage path
    const { data: docRecord, error: fetchError } = await (supabaseAdmin.from("documents") as any)
      .select("storage_path")
      .eq("id", documentId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (docRecord && docRecord.storage_path) {
      // Delete the file from the storage bucket
      const { error: storageError } = await supabaseAdmin.storage
        .from("documents")
        .remove([docRecord.storage_path]);

      if (storageError) {
        console.error("Failed to delete from storage:", storageError);
        // Continue anyway to delete the database record
      }
    }

    // Delete the database record
    const { error: deleteError } = await (supabaseAdmin.from("documents") as any)
      .delete()
      .eq("id", documentId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ ok: true, documentId });
  } catch (err: any) {
    console.error("reject-document API error:", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
