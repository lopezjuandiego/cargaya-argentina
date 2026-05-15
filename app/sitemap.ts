import { MetadataRoute } from "next";
import { getDb } from "@/lib/db";

const BASE = "https://dondecargar.com.ar";

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

  const provinceRows = (await sql`
    SELECT DISTINCT province FROM "Station"
    WHERE province IS NOT NULL AND province <> '' AND province <> 'Rocha'
  `) as { province: string }[];

  const cityRows = (await sql`
    SELECT DISTINCT province, city FROM "Station"
    WHERE province IS NOT NULL AND province <> '' AND province <> 'Rocha'
      AND city IS NOT NULL AND city <> ''
  `) as { province: string; city: string }[];

  const { provinceToSlug, cityToSlug } = await import("@/lib/provinces");

  const provinceUrls: MetadataRoute.Sitemap = provinceRows.map((r) => ({
    url: `${BASE}/estaciones/${provinceToSlug(r.province)}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const cityUrls: MetadataRoute.Sitemap = cityRows.map((r) => ({
    url: `${BASE}/estaciones/${provinceToSlug(r.province)}/${cityToSlug(r.city)}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const blogRows = (await sql`
    SELECT slug, "publishedAt", "updatedAt" FROM "BlogPost"
    WHERE published = true ORDER BY "publishedAt" DESC
  `) as { slug: string; publishedAt: string; updatedAt: string }[];

  const blogUrls: MetadataRoute.Sitemap = [
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...blogRows.map((p) => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/ruta`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/estaciones`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/agregar`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/terminos`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/privacidad`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    ...blogUrls,
    ...provinceUrls,
    ...cityUrls,
    ...stationUrls,
  ];
}
