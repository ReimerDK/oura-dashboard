import { handlers } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const originalGET = handlers.GET;

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  if (url.pathname.includes("/callback/")) {
    console.log("[oura-callback] params:", Object.fromEntries(url.searchParams));
  }
  return originalGET(req);
}

export const POST = handlers.POST;
