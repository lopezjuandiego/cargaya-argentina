import { db } from "./db";

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
  isFree: number;
  source: string;
  isVerified: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  // computed
  distanceKm?: number;
  lastStatus?: "working" | "not_working" | null;
};

export type StatusReport = {
  id: number;
  stationId: number;
  isWorking: number;
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

export function getNearbyStations(
  lat: number,
  lng: number,
  radiusKm = 50,
  limit = 30
): Station[] {
  const rows = db
    .prepare("SELECT * FROM Station ORDER BY name")
    .all() as Station[];

  return rows
    .map((s) => ({ ...s, distanceKm: haversineKm(lat, lng, s.lat, s.lng) }))
    .filter((s) => s.distanceKm! <= radiusKm)
    .sort((a, b) => a.distanceKm! - b.distanceKm!)
    .slice(0, limit);
}

export function getStation(id: number): Station | undefined {
  return db
    .prepare("SELECT * FROM Station WHERE id = ?")
    .get(id) as Station | undefined;
}

export function getStatusReports(stationId: number): StatusReport[] {
  return db
    .prepare(
      "SELECT * FROM StatusReport WHERE stationId = ? ORDER BY reportedAt DESC LIMIT 10"
    )
    .all(stationId) as StatusReport[];
}

export function getLastStatus(
  stationId: number
): "working" | "not_working" | null {
  const report = db
    .prepare(
      "SELECT isWorking FROM StatusReport WHERE stationId = ? ORDER BY reportedAt DESC LIMIT 1"
    )
    .get(stationId) as { isWorking: number } | undefined;
  if (!report) return null;
  return report.isWorking ? "working" : "not_working";
}

export function addStatusReport(
  stationId: number,
  isWorking: boolean,
  comment: string | null,
  reporterIp: string | null
): void {
  db.prepare(
    "INSERT INTO StatusReport (stationId, isWorking, comment, reporterIp, reportedAt) VALUES (?, ?, ?, ?, ?)"
  ).run(stationId, isWorking ? 1 : 0, comment, reporterIp, new Date().toISOString());
}

export function addUserSubmission(data: {
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
}): void {
  db.prepare(
    `INSERT INTO UserSubmission (name, operator, address, city, province, lat, lng, connectorTypes, powerKw, comment, status, submittedAt)
     VALUES (@name, @operator, @address, @city, @province, @lat, @lng, @connectorTypes, @powerKw, @comment, 'pending', @submittedAt)`
  ).run({ ...data, submittedAt: new Date().toISOString() });
}

export function searchStationsByCity(query: string, limit = 20): Station[] {
  const like = `%${query}%`;
  return db
    .prepare(
      "SELECT * FROM Station WHERE city LIKE ? OR province LIKE ? OR name LIKE ? OR address LIKE ? ORDER BY city LIMIT ?"
    )
    .all(like, like, like, like, limit) as Station[];
}

export function getAllStations(): Station[] {
  return db.prepare("SELECT * FROM Station ORDER BY province, city, name").all() as Station[];
}
