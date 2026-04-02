import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isSuperadminRoute = pathname.startsWith("/superadmin");
  const isLoginRoute =
    pathname.startsWith("/admin/login") || pathname.startsWith("/superadmin/login");

  if ((!isAdminRoute && !isSuperadminRoute) || isLoginRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get("qr_menu_token")?.value;

  if (token) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = isSuperadminRoute ? "/superadmin/login" : "/admin/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/superadmin/:path*"],
};
