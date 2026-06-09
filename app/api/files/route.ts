import { NextResponse } from "next/server";
import { readDocumentFile } from "@/lib/storage";
import path from "path";

export const runtime = "nodejs";

const extensionToMime: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const storagePath = url.searchParams.get("path")?.trim();

  if (!storagePath) {
    return NextResponse.json({ error: "Missing path." }, { status: 400 });
  }

  try {
    const buffer = await readDocumentFile(storagePath);
    const extension = path.extname(storagePath).slice(1).toLowerCase();
    const contentType = extensionToMime[extension] ?? "application/octet-stream";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }
}
