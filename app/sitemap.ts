import { MetadataRoute } from "next";
import { getDb } from "@/lib/db";

const BASE = "https://cargaya-argentina.vercel.app";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sql = getDb();
  const stations = (await sql`
    SELECT id, "updatedAt" FROM "Station" ORDER BY id
  `) as { id: number; updatedAt: string }[];

  const stationUrls: MetadataRoute.Sitemap = stations.map((s) => ({
    url: `${BASE}/estacion/${s.id}`,
    lastModified: new Date(s.updatedAt),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/ruta`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/agregar`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/terminos`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/privacidad`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    ...stationUrls,
  ];
}
