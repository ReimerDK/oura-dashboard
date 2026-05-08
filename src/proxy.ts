import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export default auth(function proxy(req: NextRequest & { auth?: unknown }) {
  const isAuthenticated = !!(req as { auth?: { user?: unknown } }).auth?.user;
  const path = req.nextUrl.pathname;

  if (path.startsWith("/dashboard") && !isAuthenticated) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (path === "/" && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
