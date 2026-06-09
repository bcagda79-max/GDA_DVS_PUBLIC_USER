import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const result = await db.query(`SELECT COUNT(1)::int AS count FROM documents`);
    const totalDocuments = result.rows[0]?.count ?? 0;
    const departmentsCount = 7;
    return NextResponse.json({ totalDocuments, departmentsCount });
  } catch (e) {
    return NextResponse.json({ totalDocuments: 0, departmentsCount: 6 });
  }
}
