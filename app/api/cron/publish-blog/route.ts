import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();
  const published = await sql`
    UPDATE "BlogPost"
    SET published = true
    WHERE published = false
      AND "publishedAt" IS NOT NULL
      AND "publishedAt" <= NOW()
    RETURNING id, title, slug, "publishedAt"
  `;

  return NextResponse.json({ published, count: published.length });
}
