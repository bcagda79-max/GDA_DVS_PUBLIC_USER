import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOfficerContextByUserId } from "@/lib/officer-access";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const ctx = await getOfficerContextByUserId(userId);
    if (!ctx?.isAdmin) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const result = await db.query(`SELECT * FROM documents WHERE verified = true ORDER BY created_at DESC`);

    return NextResponse.json({ documents: result.rows ?? [] }, { status: 200 });
  } catch (error: any) {
    console.error("Vault Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve documents." },
      { status: 500 }
    );
  }
}
