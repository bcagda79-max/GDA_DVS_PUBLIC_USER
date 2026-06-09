import { db } from "./db";

export type OfficerRole = "admin" | "officer";

export type OfficerRecord = {
  id: string;
  user_id: string | null;
  email: string;
  full_name: string;
  designation: string;
  department: string;
  role: OfficerRole;
  confirmed: boolean;
  approved: boolean;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
};

export type OfficerContext = OfficerRecord & {
  isAdmin: boolean;
  canGenerate: boolean;
  isPending: boolean;
};

export async function getOfficerByUserId(userId: string) {
  const result = await db.query(
    `SELECT id, user_id, email, full_name, designation, department, role, confirmed, approved, approved_at, approved_by, created_at
     FROM officers
     WHERE user_id = $1
     LIMIT 1`,
    [userId],
  );

  if (!result.rows.length) {
    return null;
  }

  return result.rows[0] as OfficerRecord;
}

export async function getOfficerContextByUserId(userId: string): Promise<OfficerContext | null> {
  const officer = await getOfficerByUserId(userId);

  if (!officer) {
    return null;
  }

  return {
    ...officer,
    isAdmin: officer.role === "admin",
    canGenerate: officer.role === "admin" || officer.approved,
    isPending: officer.role !== "admin" && !officer.approved,
  };
}
