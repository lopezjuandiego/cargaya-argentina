import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { type, message, email, page } = await req.json();

    if (!message?.trim() || message.length > 2000) {
      return NextResponse.json({ error: "Mensaje requerido (máx. 2000 caracteres)" }, { status: 400 });
    }

    const sql = getDb();
    await sql`
      INSERT INTO "Feedback" (type, message, email, page, "createdAt")
      VALUES (
        ${(type ?? "general").slice(0, 30)},
        ${message.trim().slice(0, 2000)},
        ${email ? email.slice(0, 200) : null},
        ${page ? page.slice(0, 200) : null},
        NOW()
      )
    `;

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
