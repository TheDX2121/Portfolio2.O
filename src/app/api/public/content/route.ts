import { NextResponse } from "next/server";
import { getFullContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getFullContent();
  return NextResponse.json(data);
}
