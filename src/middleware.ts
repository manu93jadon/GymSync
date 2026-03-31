import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_PREFIXES: Record<string, string> = {
  "/admin": "ADMIN",
  "/coach": "COACH",
  "/member": "MEMBER",
};

const AUTH_PATHS = ["/login"];

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  // Redirect unauthenticated users to login
  if (!token && !AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect authenticated users away from auth pages
  if (token && AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    const dest = `/${(token.role as string).toLowerCase()}`;
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // Enforce role-based route access
  if (token) {
    for (const [prefix, requiredRole] of Object.entries(ROLE_PREFIXES)) {
      if (pathname.startsWith(prefix) && token.role !== requiredRole) {
        const dest = `/${(token.role as string).toLowerCase()}`;
        return NextResponse.redirect(new URL(dest, req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
