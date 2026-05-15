import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type Station = {
  id: number;
  name: string;
  operator: string;
  category: string | null;
  address: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
  connectorTypes: string;
  powerKw: number | null;
  isFree: boolean;
  isVerified: boolean;
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

function pointToSegmentKm(
  plat: number, plng: number,
  alat: number, alng: number,
  blat: number, blng: number
): { distKm: number; t: number } {
  const midLat = (alat + blat) / 2;
  const cosLat = Math.cos((midLat * Math.PI) / 180);
  const K = 111;
  const ax = alng * cosLat * K, ay = alat * K;
  const bx = blng * cosLat * K, by = blat * K;
  const px = plng * cosLat * K, py = plat * K;
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return { distKm: haversineKm(plat, plng, alat, alng), t: 0 };
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return {
    distKm: haversineKm(plat, plng, alat + t * (blat - alat), alng + t * (blng - alng)),
    t,
  };
}

function distanceToRoute(
  plat: number,
  plng: number,
  route: [number, number][]
): { distKm: number; position: number } {
  let minDist = Infinity;
  let totalLen = 0;
  let bestPos = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const [alng, alat] = route[i];
    const [blng, blat] = route[i + 1];
    const segLen = haversineKm(alat, alng, blat, blng);
    const { distKm, t } = pointToSegmentKm(plat, plng, alat, alng, blat, blng);
    if (distKm < minDist) {
      minDist = distKm;
      bestPos = totalLen + t * segLen;
    }
    totalLen += segLen;
  }
  return { distKm: minDist, position: bestPos };
}

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const fromLat = parseFloat(p.get("from_lat") ?? "");
  const fromLng = parseFloat(p.get("from_lng") ?? "");
  const toLat = parseFloat(p.get("to_lat") ?? "");
  const toLng = parseFloat(p.get("to_lng") ?? "");
  const radio = Math.min(50, Math.max(1, parseFloat(p.get("radio") ?? "10")));

  const validCoord = (n: number) => Number.isFinite(n) && n >= -90 && n <= 90;
  const validLng = (n: number) => Number.isFinite(n) && n >= -180 && n <= 180;
  if (!validCoord(fromLat) || !validCoord(toLat) || !validLng(fromLng) || !validLng(toLng)) {
    return NextResponse.json({ error: "Coordenadas inválidas" }, { status: 400 });
  }

  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
  let routeCoords: [number, number][];
  let distanceKm: number;
  let durationMin: number;
  try {
    const osrmRes = await fetch(osrmUrl, {
      headers: { "User-Agent": "CargaYa/1.0 (contacto@cargaya.com.ar)" },
      next: { revalidate: 3600 },
    });
    const osrmData = await osrmRes.json();
    if (!osrmData.routes?.length) {
      return NextResponse.json(
        { error: "No se pudo calcular la ruta entre esos puntos" },
        { status: 404 }
      );
    }
    routeCoords = osrmData.routes[0].geometry.coordinates;
    distanceKm = osrmData.routes[0].distance / 1000;
    durationMin = Math.round(osrmData.routes[0].duration / 60);
  } catch {
    return NextResponse.json(
      { error: "Error al conectar con el servicio de rutas" },
      { status: 502 }
    );
  }

  // Bounding box via loop (safe for large polylines)
  let minLat = Infinity, maxLat = -Infinity;
  let minLng = Infinity, maxLng = -Infinity;
  for (const [lng, lat] of routeCoords) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }
  const avgLat = (minLat + maxLat) / 2;
  const latBuf = radio / 111;
  const lngBuf = radio / (111 * Math.cos((avgLat * Math.PI) / 180));

  const sql = getDb();
  const rows = (await sql`
    SELECT id, name, operator, category, address, city, province,
           lat, lng, "connectorTypes", "powerKw", "isFree", "isVerified"
    FROM "Station"
    WHERE lat BETWEEN ${minLat - latBuf} AND ${maxLat + latBuf}
      AND lng BETWEEN ${minLng - lngBuf} AND ${maxLng + lngBuf}
  `) as Station[];

  const candidates = rows
    .map((s) => {
      const { distKm, position } = distanceToRoute(s.lat, s.lng, routeCoords);
      return { ...s, distanceKm: distKm, position };
    })
    .filter((s) => s.distanceKm <= radio)
    .sort((a, b) => a.position - b.position);

  const ids = candidates.map((s) => s.id);
  const statusMap = new Map<number, boolean>();
  if (ids.length > 0) {
    const reports = (await sql`
      SELECT DISTINCT ON ("stationId") "stationId", "isWorking"
      FROM "StatusReport"
      WHERE "stationId" = ANY(${ids})
      ORDER BY "stationId", "reportedAt" DESC
    `) as { stationId: number; isWorking: boolean }[];
    reports.forEach((r) => statusMap.set(r.stationId, r.isWorking));
  }

  const stations = candidates.map((s) => ({
    ...s,
    lastStatus: statusMap.has(s.id)
      ? statusMap.get(s.id)
        ? "working"
        : "not_working"
      : null,
  }));

  // Convert OSRM [lng, lat] → [lat, lng] for Leaflet
  const geometry = routeCoords.map(([lng, lat]) => [lat, lng] as [number, number]);

  return NextResponse.json({
    stations,
    route: { distanceKm: Math.round(distanceKm), durationMin },
    geometry,
  });
}
