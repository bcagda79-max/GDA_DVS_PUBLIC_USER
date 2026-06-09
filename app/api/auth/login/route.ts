import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, signJwt } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const result = await db.query(
    `SELECT id, user_id, email, role, password_hash FROM officers WHERE email = $1 LIMIT 1`,
    [email],
  );

  const user = result.rows[0];
  if (!user || !user.password_hash) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const token = signJwt({ userId: user.user_id ?? user.id, role: user.role });
  const response = NextResponse.json({ ok: true });
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
