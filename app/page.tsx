import { getDb } from "@/lib/db";
import HomeClient from "./HomeClient";

export const revalidate = 3600; // revalidar el count cada hora

async function getStationCount(): Promise<number> {
  try {
    const rows = await getDb()`SELECT COUNT(*)::int AS n FROM "Station"`;
    return (rows[0] as { n: number }).n;
  } catch {
    return 0;
  }
}

export default async function Home() {
  const count = await getStationCount();
  return <HomeClient stationCount={count} />;
}
