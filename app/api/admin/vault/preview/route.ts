import { NextResponse } from "next/server";
import { getOfficerContextByUserId } from "@/lib/officer-access";
import { getDocumentFileUrl } from "@/lib/storage";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const storagePath = searchParams.get("path");

    if (!userId || !storagePath) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const ctx = await getOfficerContextByUserId(userId);
    if (!ctx?.isAdmin) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    return NextResponse.json({ url: getDocumentFileUrl(storagePath) }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate preview." },
      { status: 500 }
    );
  }
}
