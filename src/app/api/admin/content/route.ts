import { NextRequest, NextResponse } from "next/server";
import { getIsAdmin } from "@/lib/auth";
import { getFullContent, updateSiteContent } from "@/lib/content";

export async function GET() {
  if (!(await getIsAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await getFullContent();
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  if (!(await getIsAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const patch = await request.json().catch(() => null);
  if (!patch || typeof patch !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  // id/updatedAt are managed by the server, never trust the client for those.
  delete patch.id;
  delete patch.updatedAt;
  const row = await updateSiteContent(patch);
  return NextResponse.json({ content: row });
}
