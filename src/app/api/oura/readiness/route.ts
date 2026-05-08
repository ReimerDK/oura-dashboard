import { auth } from "@/lib/auth";
import { OuraClient } from "@/lib/oura/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start") ?? "";
  const end = searchParams.get("end") ?? "";

  const client = new OuraClient(session.user.id);
  try {
    const data = await client.getDailyReadiness(start, end);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
