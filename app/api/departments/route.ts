import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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

export async function GET() {
  try {
    const result = await db.query("SELECT name FROM departments ORDER BY name ASC");
    const custom: string[] = result.rows.map((row) => String(row.name));
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
