import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { workItems } from "@/db/schema";
import { getIsAdmin } from "@/lib/auth";
import { getWorkItems } from "@/lib/content";

export async function GET() {
  if (!(await getIsAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ items: await getWorkItems() });
}

export async function POST(request: NextRequest) {
  if (!(await getIsAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  delete body.id;
  const [row] = await db
    .insert(workItems)
    .values({
      title: body.title ?? "",
      category: body.category ?? "",
      year: body.year ?? "",
      cover: body.cover ?? "",
      video: body.video ?? "",
      gallery: Array.isArray(body.gallery) ? body.gallery : [],
      description: body.description ?? "",
      link: body.link ?? "",
      featured: !!body.featured,
      visible: body.visible !== false,
      order: Number.isFinite(body.order) ? body.order : 0,
    })
    .returning();
  return NextResponse.json({ item: row }, { status: 201 });
}
