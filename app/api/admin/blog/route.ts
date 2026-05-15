import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getExpectedToken } from "@/lib/admin-auth";

async function isAuthorized(req: NextRequest) {
  const cookie = req.cookies.get("admin_auth")?.value;
  return !!cookie && cookie === (await getExpectedToken());
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

// GET: list all posts
export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const sql = getDb();
  const posts = await sql`
    SELECT id, title, slug, excerpt, published, "publishedAt", "createdAt"
    FROM "BlogPost" ORDER BY "createdAt" DESC
  `;
  return NextResponse.json(posts);
}

// POST: create post
export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { title, slug, excerpt, content, published } = await req.json();
  if (!title?.trim() || !content?.trim()) return NextResponse.json({ error: "Título y contenido requeridos" }, { status: 400 });

  const finalSlug = slug?.trim() || slugify(title);
  const sql = getDb();
  const rows = await sql`
    INSERT INTO "BlogPost" (title, slug, excerpt, content, published, "publishedAt", "createdAt", "updatedAt")
    VALUES (
      ${title.trim()}, ${finalSlug}, ${excerpt?.trim() || ""},
      ${content.trim()}, ${!!published},
      ${published ? new Date().toISOString() : null},
      NOW(), NOW()
    )
    RETURNING id, slug
  `;
  return NextResponse.json(rows[0]);
}
