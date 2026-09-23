import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { collabs } from "@/db/schema";
import { getIsAdmin } from "@/lib/auth";
import { getCollabs } from "@/lib/content";

export async function GET() {
  if (!(await getIsAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ items: await getCollabs() });
}

export async function POST(request: NextRequest) {
  if (!(await getIsAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  delete body.id;
  const [row] = await db
    .insert(collabs)
    .values({
      name: body.name ?? "",
      role: body.role ?? "",
      year: body.year ?? "",
      logo: body.logo ?? "",
      description: body.description ?? "",
      visible: body.visible !== false,
      order: Number.isFinite(body.order) ? body.order : 0,
    })
    .returning();
  return NextResponse.json({ item: row }, { status: 201 });
}
