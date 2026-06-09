import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, email, fullName, designation, department, role } = body as {
      userId?: string;
      email?: string;
      fullName?: string;
      designation?: string;
      department?: string;
      role?: string;
    };

    if (!userId || !email) {
      return NextResponse.json({ error: "userId and email are required." }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingResult = await db.query(
      `SELECT id, role, approved FROM officers WHERE email = $1 LIMIT 1`,
      [normalizedEmail],
    );

    const existingOfficer = existingResult.rows[0];

    if (existingOfficer) {
      const updatePayload = {
        user_id: userId,
        email: normalizedEmail,
        role: existingOfficer.role ?? role ?? "officer",
        confirmed: true,
        approved: existingOfficer.role === "admin" ? true : existingOfficer.approved ?? false,
        full_name: fullName ?? normalizedEmail,
        designation: designation ?? "Officer",
        department: department ?? "BCA",
      };

      await db.query(
        `UPDATE officers SET user_id = $1, email = $2, role = $3, confirmed = $4, approved = $5, full_name = $6, designation = $7, department = $8 WHERE email = $9`,
        [
          updatePayload.user_id,
          updatePayload.email,
          updatePayload.role,
          updatePayload.confirmed,
          updatePayload.approved,
          updatePayload.full_name,
          updatePayload.designation,
          updatePayload.department,
          normalizedEmail,
        ],
      );
    } else {
      await db.query(
        `INSERT INTO officers (user_id, email, full_name, designation, department, role, confirmed, approved)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          userId,
          normalizedEmail,
          fullName ?? normalizedEmail,
          designation ?? "Officer",
          department ?? "BCA",
          role === "admin" ? "admin" : "officer",
          true,
          role === "admin",
        ],
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to complete officer registration.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}



