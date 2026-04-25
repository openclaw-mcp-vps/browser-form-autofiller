import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_COOKIE_NAME } from "@/lib/auth";

const protectedPaths = ["/tool", "/profiles", "/settings"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  const hasAccess = request.cookies.get(ACCESS_COOKIE_NAME)?.value === "1";

  if (hasAccess) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/paywall";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/tool/:path*", "/profiles/:path*", "/settings/:path*"]
};
