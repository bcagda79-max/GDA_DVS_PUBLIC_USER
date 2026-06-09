import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ allowed: false }, { status: 400 });
    }

    const result = await db.query(
      `SELECT id FROM officers WHERE user_id = $1 AND confirmed = true LIMIT 1`,
      [userId],
    );

    return NextResponse.json({ allowed: result.rows.length > 0 });
  } catch (err) {
    return NextResponse.json({ allowed: false }, { status: 500 });
  }
}
