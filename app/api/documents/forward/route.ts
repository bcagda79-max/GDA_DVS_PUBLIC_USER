import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const documentId = String(body.documentId || "").trim();

    if (!documentId) {
      return NextResponse.json({ error: "documentId is required" }, { status: 400 });
    }

    await db.query(
      `UPDATE documents SET is_forwarded = true WHERE id = $1`,
      [documentId],
    );

    return NextResponse.json({ ok: true, documentId });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
