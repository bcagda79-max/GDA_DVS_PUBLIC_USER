import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// include rejected fields so clients can show rejected state without extra queries
const officerSelect = "id, user_id, email, full_name, designation, department, role, confirmed, approved, approved_at, approved_by, rejected, rejected_at, rejected_by, created_at";

const monthlyCount = async (tableName: string, timestampColumn: string) => {
  const now = new Date();
  const months: { label: string; value: number }[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();

    const result = await db.query(
      `SELECT COUNT(1)::int AS count FROM ${tableName} WHERE ${timestampColumn} >= $1 AND ${timestampColumn} < $2`,
      [start, end],
    );

    months.push({
      label: d.toLocaleString("en-US", { month: "short" }),
      value: result.rows[0]?.count ?? 0,
    });
  }

  return months;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId")?.trim();

  if (!userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

  const adminResult = await db.query(
    `SELECT ${officerSelect} FROM officers WHERE user_id = $1 AND role = 'admin' LIMIT 1`,
    [userId],
  );

  if (!adminResult.rows[0]) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const [totalOfficersResult, pendingRequestsResult, totalDocumentsResult, totalLoginsResult] = await Promise.all([
    db.query(`SELECT COUNT(1)::int AS count FROM officers`),
    db.query(`SELECT COUNT(1)::int AS count FROM officers WHERE role = 'officer' AND approved = false`),
    db.query(`SELECT COUNT(1)::int AS count FROM documents`),
    db.query(`SELECT COUNT(1)::int AS count FROM officer_logins`),
  ]);

  const pendingOfficersResult = await db.query(
    `SELECT ${officerSelect} FROM officers WHERE role = 'officer' AND approved = false ORDER BY created_at DESC LIMIT 20`,
  );

  const allOfficersResult = await db.query(
    `SELECT ${officerSelect} FROM officers WHERE role = 'officer' ORDER BY created_at DESC LIMIT 500`,
  );

  const documentsResult = await db.query(
    `SELECT id, title, department, recipient_name, processed_by, created_at FROM documents ORDER BY created_at DESC LIMIT 20`,
  );

  const loginLogsResult = await db.query(
    `SELECT id, user_id, email, full_name, role, login_status, ip_address, browser, operating_system, device_type, created_at FROM officer_logins ORDER BY created_at DESC LIMIT 25`,
  );

  const userIds = Array.from(
    new Set([
      ...documentsResult.rows.map((row: any) => row.processed_by).filter(Boolean),
      ...loginLogsResult.rows.map((row: any) => row.user_id).filter(Boolean),
      ...pendingOfficersResult.rows.map((row: any) => row.user_id).filter(Boolean),
    ]),
  );

  let officerNameMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const namesResult = await db.query(
      `SELECT user_id, full_name FROM officers WHERE user_id = ANY($1::text[])`,
      [userIds],
    );
    officerNameMap = namesResult.rows.reduce((acc: Record<string, string>, row: any) => {
      if (row.user_id) acc[row.user_id] = row.full_name;
      return acc;
    }, {});
  }

  return NextResponse.json({
    metrics: {
      totalOfficers: totalOfficersResult.rows[0]?.count ?? 0,
      pendingRequests: pendingRequestsResult.rows[0]?.count ?? 0,
      totalDocuments: totalDocumentsResult.rows[0]?.count ?? 0,
      totalLogins: totalLoginsResult.rows[0]?.count ?? 0,
    },
    documentsMonthly: await monthlyCount("documents", "created_at"),
    loginsMonthly: await monthlyCount("officer_logins", "created_at"),
    pendingOfficers: pendingOfficersResult.rows.map((row: any) => ({
      ...row,
      name: row.full_name,
    })),
    allOfficers: allOfficersResult.rows.map((row: any) => ({
      ...row,
      name: row.full_name,
    })),
    documentHistory: documentsResult.rows.map((row: any) => ({
      ...row,
      officerName: row.processed_by ? officerNameMap[row.processed_by] ?? "Unknown officer" : "Unknown officer",
    })),
    loginHistory: loginLogsResult.rows.map((row: any) => ({
      ...row,
      officerName: row.user_id ? officerNameMap[row.user_id] ?? row.full_name ?? "Unknown officer" : row.full_name ?? "Unknown officer",
    })),
  });
}
