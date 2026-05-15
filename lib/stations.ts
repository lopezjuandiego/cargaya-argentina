import { getDb } from "./db";

export type Station = {
  id: number;
  name: string;
  operator: string;
  category: string | null;
  address: string;
  city: string;
  province: string;
  postalCode: string | null;
  lat: number;
  lng: number;
  connectorTypes: string;
  powerKw: number | null;
  accessType: string;
  isFree: boolean;
  source: string;
  isVerified: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  distanceKm?: number;
  lastStatus?: "working" | "not_working" | null;
};

export type StatusReport = {
  id: number;
  stationId: number;
  isWorking: boolean;
  comment: string | null;
  reportedAt: string;
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function getNearbyStations(
  lat: number,
  lng: number,
  radiusKm = 15,
  limit = 30
): Promise<Station[]> {
  const rows = (await getDb()`SELECT * FROM "Station"`) as Station[];
  return rows
    .map((s) => ({ ...s, distanceKm: haversineKm(lat, lng, s.lat, s.lng) }))
    .filter((s) => s.distanceKm! <= radiusKm)
    .sort((a, b) => a.distanceKm! - b.distanceKm!)
    .slice(0, limit);
}

export async function getClosestStation(
  lat = -34.6037,
  lng = -58.3816
): Promise<(Station & { distanceKm: number }) | null> {
  const rows = (await getDb()`SELECT * FROM "Station"`) as Station[];
  if (!rows.length) return null;
  const sorted = rows
    .map((s) => ({ ...s, distanceKm: haversineKm(lat, lng, s.lat, s.lng) }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
  return sorted[0];
}

export async function getStation(id: number): Promise<Station | null> {
  const rows = (await getDb()`SELECT * FROM "Station" WHERE id = ${id}`) as Station[];
  return rows[0] ?? null;
}

export async function getStatusReports(stationId: number): Promise<StatusReport[]> {
  return (await getDb()`
    SELECT * FROM "StatusReport"
    WHERE "stationId" = ${stationId}
    ORDER BY "reportedAt" DESC
    LIMIT 10
  `) as StatusReport[];
}

export async function getLastStatus(
  stationId: number
): Promise<"working" | "not_working" | null> {
  const rows = (await getDb()`
    SELECT "isWorking" FROM "StatusReport"
    WHERE "stationId" = ${stationId}
    ORDER BY "reportedAt" DESC
    LIMIT 1
  `) as { isWorking: boolean }[];
  if (!rows.length) return null;
  return rows[0].isWorking ? "working" : "not_working";
}

export async function addStatusReport(
  stationId: number,
  isWorking: boolean,
  comment: string | null,
  reporterIp: string | null
): Promise<void> {
  await getDb()`
    INSERT INTO "StatusReport" ("stationId", "isWorking", comment, "reporterIp", "reportedAt")
    VALUES (${stationId}, ${isWorking}, ${comment}, ${reporterIp}, NOW())
  `;
}

export async function addUserSubmission(data: {
  name: string;
  operator: string;
  address: string;
  city: string;
  province: string;
  lat: number | null;
  lng: number | null;
  connectorTypes: string;
  powerKw: number | null;
  comment: string | null;
  submitterIp: string | null;
}): Promise<void> {
  await getDb()`
    INSERT INTO "UserSubmission"
      (name, operator, address, city, province, lat, lng, "connectorTypes", "powerKw", comment, status, "submittedAt", "submitterIp")
    VALUES
      (${data.name}, ${data.operator}, ${data.address}, ${data.city}, ${data.province},
       ${data.lat}, ${data.lng}, ${data.connectorTypes}, ${data.powerKw}, ${data.comment},
       'pending', NOW(), ${data.submitterIp})
  `;
}
