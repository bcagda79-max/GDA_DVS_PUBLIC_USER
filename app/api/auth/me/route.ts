import { NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { getOfficerContextByUserId } from "@/lib/officer-access";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ user: null });
  }

  const payload = verifyJwt(token);
  if (!payload || typeof payload !== "object" || !payload.userId) {
    return NextResponse.json({ user: null });
  }

  const userId = String(payload.userId);
  const context = await getOfficerContextByUserId(userId);

  if (!context) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      userId: context.user_id,
      email: context.email,
      fullName: context.full_name,
      designation: context.designation,
      department: context.department,
      role: context.role,
      confirmed: context.confirmed,
      approved: context.approved,
      isAdmin: context.isAdmin,
      canGenerate: context.canGenerate,
      isPending: context.isPending,
    },
  });
}
