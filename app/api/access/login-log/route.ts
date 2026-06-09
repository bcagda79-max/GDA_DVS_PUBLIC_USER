import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const detectBrowser = (userAgent: string) => {
  if (/Edg\//i.test(userAgent)) return "Edge";
  if (/Chrome\//i.test(userAgent)) return "Chrome";
  if (/Firefox\//i.test(userAgent)) return "Firefox";
  if (/Safari\//i.test(userAgent)) return "Safari";
  return "Unknown";
};

const detectOS = (userAgent: string) => {
  if (/Windows NT/i.test(userAgent)) return "Windows";
  if (/Mac OS X/i.test(userAgent)) return "macOS";
  if (/Android/i.test(userAgent)) return "Android";
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "iOS";
  if (/Linux/i.test(userAgent)) return "Linux";
  return "Unknown";
};

const detectDeviceType = (userAgent: string) =>
  /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent) ? "Mobile" : "Desktop";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = String(body.userId ?? "").trim();

    if (!userId) {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }

    const officerResult = await db.query(
      `SELECT user_id, email, full_name, role FROM officers WHERE user_id = $1 LIMIT 1`,
      [userId],
    );

    const officer = officerResult.rows[0];
    if (!officer) {
      console.error(`login-log: officer not found for userId=${userId}`);
      return NextResponse.json({ error: "Officer not found." }, { status: 404 });
    }

    const userAgent = String(body.userAgent ?? request.headers.get("user-agent") ?? "");
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("cf-connecting-ip") ??
      request.headers.get("x-real-ip") ??
      null;

    const resolvedBrowser = detectBrowser(userAgent);
    const resolvedOS = detectOS(userAgent);
    const resolvedDevice = detectDeviceType(userAgent);

    await db.query(
      `INSERT INTO officer_logins (user_id, email, full_name, role, login_status, ip_address, browser, operating_system, device_type, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        officer.user_id,
        officer.email,
        officer.full_name,
        officer.role ?? "officer",
        String(body.status ?? body.loginStatus ?? "approved"),
        ipAddress,
        resolvedBrowser,
        resolvedOS,
        resolvedDevice,
        userAgent,
      ],
    );

    console.log(`login-log: recorded login for userId=${userId}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to log login.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
