import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { experiences } from "@/db/schema";
import { getIsAdmin } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  if (!(await getIsAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  delete body.id;

  const [row] = await db
    .update(experiences)
    .set({
      company: body.company ?? "",
      role: body.role ?? "",
      experience: body.experience ?? "",
      about: body.about ?? "",
      myRole: body.myRole ?? "",
      visible: body.visible !== false,
      order: Number.isFinite(body.order) ? body.order : 0,
    })
    .where(eq(experiences.id, numId))
    .returning();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item: row });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  if (!(await getIsAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await db.delete(experiences).where(eq(experiences.id, numId));
  return NextResponse.json({ ok: true });
}
