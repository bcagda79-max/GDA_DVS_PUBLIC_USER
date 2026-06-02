import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const documentId = String(body.documentId || "").trim();

    if (!documentId) {
      return NextResponse.json({ error: "documentId is required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) return NextResponse.json({ error: "Missing Supabase env" }, { status: 500 });

    const { error } = await (supabaseAdmin.from("documents") as any).update({ is_forwarded: true }).eq("id", documentId);
    if (error) {
      const msg = String(error.message || error).toLowerCase();
      const code = (error as any)?.code;
      // If the DB schema hasn't been migrated yet (missing column), return
      // a soft success so officers can continue their workflow. The proper
      // fix is to run the supplied SQL migration to add `is_forwarded`.
      if (msg.includes("could not find") || msg.includes("is_forwarded") || code === "PGRST204") {
        // eslint-disable-next-line no-console
        console.warn("Forward warning: documents.is_forwarded column missing in DB schema.", msg || error);
        return NextResponse.json({ ok: true, documentId, warning: "schema_missing_is_forwarded" });
      }

      throw error;
    }

    return NextResponse.json({ ok: true, documentId });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
