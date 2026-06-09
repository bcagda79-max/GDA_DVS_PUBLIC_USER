import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      fullName,
      designation,
      department,
      userId,
      role,
    } = body as {
      email?: string;
      fullName?: string;
      designation?: string;
      department?: string;
      userId?: string | null;
      role?: string;
    };

    if (!email) {
      return NextResponse.json({ error: "email is required." }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingResult = await db.query(
      `SELECT id, role, approved FROM officers WHERE email = $1 LIMIT 1`,
      [normalizedEmail],
    );

    const existingOfficer = existingResult.rows[0];
    const payload = {
      email: normalizedEmail,
      user_id: userId ?? null,
      full_name: fullName ?? normalizedEmail,
      designation: designation ?? "Officer",
      department: department ?? "BCA",
      role: role === "admin" ? "admin" : existingOfficer?.role ?? "officer",
      confirmed: Boolean(userId),
      approved: existingOfficer?.role === "admin" ? true : Boolean(existingOfficer?.approved),
    };

    if (existingOfficer) {
      await db.query(
        `UPDATE officers SET user_id = $1, full_name = $2, designation = $3, department = $4, role = $5, confirmed = $6, approved = $7 WHERE email = $8`,
        [
          payload.user_id,
          payload.full_name,
          payload.designation,
          payload.department,
          payload.role,
          payload.confirmed,
          payload.approved,
          normalizedEmail,
        ],
      );
    } else {
      await db.query(
        `INSERT INTO officers (user_id, email, full_name, designation, department, role, confirmed, approved)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          payload.user_id,
          payload.email,
          payload.full_name,
          payload.designation,
          payload.department,
          payload.role,
          payload.confirmed,
          payload.approved,
        ],
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create officer request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
