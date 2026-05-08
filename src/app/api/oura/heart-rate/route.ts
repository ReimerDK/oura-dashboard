import { auth } from "@/lib/auth";
import { OuraClient } from "@/lib/oura/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start") ?? "";
  const end = searchParams.get("end") ?? "";
  const type = searchParams.get("type") ?? "daily";

  const client = new OuraClient(session.user.id);
  try {
    if (type === "timeseries") {
      const data = await client.getHeartRate(`${start}T00:00:00`, `${end}T23:59:59`);
      return NextResponse.json(data);
    }
    const [readiness, spo2] = await Promise.all([
      client.getDailyReadiness(start, end),
      client.getDailySpO2(start, end),
    ]);
    return NextResponse.json({ readiness, spo2 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
