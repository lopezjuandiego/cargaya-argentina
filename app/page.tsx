import { getDb } from "@/lib/db";
import HomeClient from "./HomeClient";

export const revalidate = 3600;

async function getStats(): Promise<{ count: number; lastUpdated: string }> {
  try {
    const rows = await getDb()`
      SELECT COUNT(*)::int AS n, MAX("createdAt") AS last FROM "Station"
    `;
    const { n, last } = rows[0] as { n: number; last: string | null };
    const date = last
      ? new Date(last).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })
      : "";
    return { count: n, lastUpdated: date };
  } catch {
    return { count: 0, lastUpdated: "" };
  }
}

export default async function Home() {
  const { count, lastUpdated } = await getStats();
  return <HomeClient stationCount={count} lastUpdated={lastUpdated} />;
}
