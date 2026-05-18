import { NextRequest, NextResponse } from "next/server";
import { getExpectedToken } from "@/lib/admin-auth";

const CANONICAL_HOST = "dondecargar.com.ar";
const ALIAS_HOSTS = new Set([
  "dondecargarelectrico.com.ar",
  "dondecargoelectrico.com.ar",
]);

export async function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").split(":")[0];
  if (ALIAS_HOSTS.has(host)) {
    const url = req.nextUrl.clone();
    url.protocol = "https:";
    url.host = CANONICAL_HOST;
    return NextResponse.redirect(url, 301);
  }

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

export const config = { matcher: "/(.*)" };
