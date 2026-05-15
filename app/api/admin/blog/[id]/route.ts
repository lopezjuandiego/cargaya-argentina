import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getExpectedToken } from "@/lib/admin-auth";

async function isAuthorized(req: NextRequest) {
  const cookie = req.cookies.get("admin_auth")?.value;
  return !!cookie && cookie === (await getExpectedToken());
}

// PUT: update post
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorized(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const { title, slug, excerpt, content, published } = await req.json();
  const sql = getDb();
  await sql`
    UPDATE "BlogPost" SET
      title = ${title}, slug = ${slug}, excerpt = ${excerpt},
      content = ${content}, published = ${!!published},
      "publishedAt" = ${published ? new Date().toISOString() : null},
      "updatedAt" = NOW()
    WHERE id = ${parseInt(id)}
  `;
  return NextResponse.json({ ok: true });
}

// DELETE: remove post
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorized(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const sql = getDb();
  await sql`DELETE FROM "BlogPost" WHERE id = ${parseInt(id)}`;
  return NextResponse.json({ ok: true });
}
