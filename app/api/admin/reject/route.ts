import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getExpectedToken } from "@/lib/admin-auth";

async function isAuthorized(req: NextRequest): Promise<boolean> {
  const cookie = req.cookies.get("admin_auth")?.value;
  const expected = await getExpectedToken();
  return !!cookie && cookie === expected;
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await req.json();
  if (typeof id !== "number") {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const sql = getDb();
  await sql`UPDATE "UserSubmission" SET status = 'rejected' WHERE id = ${id} AND status = 'pending'`;
  return NextResponse.json({ ok: true });
}
