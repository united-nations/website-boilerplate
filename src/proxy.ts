import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifySession } from "@/features/auth/session";
const PUBLIC_PATHS = [
  "/about",
  "/login",
  "/verify",
  "/api/auth",
  "/api/health",
];
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (
    pathname === "/" ||
    PUBLIC_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    ) ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/")
  )
    return NextResponse.next();
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (token && verifySession(token)) return NextResponse.next();
  if (pathname.startsWith("/api/"))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.redirect(new URL("/about", request.url));
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
