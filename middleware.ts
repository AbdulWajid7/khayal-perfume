import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "khayal-admin-session";
const PARTNER_COOKIE = "khayal-partner-session";

/** Partner tokens use a derived key, so an admin token never opens the portal and vice versa. */
async function validToken(token: string | undefined, suffix = "") {
  if (!token || !process.env.AUTH_SECRET) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET + suffix));
    return true;
  } catch {
    return false;
  }
}

/** Passes the path on so server layouts can check section rights. */
function next(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/partner")) {
    if (pathname === "/partner/login") return next(request);
    if (!(await validToken(request.cookies.get(PARTNER_COOKIE)?.value, ":partner"))) {
      return NextResponse.redirect(new URL("/partner/login", request.url));
    }
    return next(request);
  }

  if (pathname === "/admin/login") return next(request);

  if (!(await validToken(request.cookies.get(SESSION_COOKIE)?.value))) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return next(request);
}

export const config = {
  matcher: ["/admin/:path*", "/partner/:path*"],
};
