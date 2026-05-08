import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const name = typeof body.name === "string" ? body.name.trim() : null;

  if (!name || name.length > 64) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }

  await prisma.user.update({ where: { id: session.user.id }, data: { name } });
  return NextResponse.json({ ok: true });
}
