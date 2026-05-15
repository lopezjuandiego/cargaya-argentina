import { NextRequest, NextResponse } from "next/server";
import { hashAdminPassword, getExpectedToken } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (!password) return NextResponse.json({ error: "Contraseña requerida" }, { status: 400 });

  const token = await hashAdminPassword(password);
  const expected = await getExpectedToken();

  if (token !== expected) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  return res;
}
