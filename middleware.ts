import { NextRequest, NextResponse } from "next/server";
import { getExpectedToken } from "@/lib/admin-auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();

  const cookie = req.cookies.get("admin_auth")?.value;
  const expected = await getExpectedToken();

  if (!cookie || cookie !== expected) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: "/admin/:path*" };
