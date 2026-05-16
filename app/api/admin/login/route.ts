import { NextRequest, NextResponse } from "next/server";
import { hashAdminPassword, getExpectedToken } from "@/lib/admin-auth";

// In-memory rate limit: max 10 attempts per IP per 15 minutes
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX = 10;
const WINDOW_MS = 15 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > MAX;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Esperá 15 minutos." },
      { status: 429 }
    );
  }

  const { password } = await req.json();
  if (!password) return NextResponse.json({ error: "Contraseña requerida" }, { status: 400 });

  const token = await hashAdminPassword(password);
  const expected = await getExpectedToken();

  if (token !== expected) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  // Login OK — limpiar contador de intentos
  attempts.delete(ip);

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
