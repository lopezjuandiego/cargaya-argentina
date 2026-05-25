import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Overpass API — free, no key needed
// Queries all charging stations in Uruguay's bounding box
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const OVERPASS_QUERY = `
[out:json][timeout:30];
node[amenity=charging_station](-35.0,-58.5,-30.0,-53.0);
out;
`.trim();

// Uruguay bounding box (strict)
const UY_LAT_MIN = -35.0, UY_LAT_MAX = -30.0;
const UY_LNG_MIN = -58.5, UY_LNG_MAX = -53.0;

// Haversine distance in km
function distKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type OsmNode = {
  lat: number; lng: number;
  name?: string; operator?: string; address?: string; city?: string;
};

// Cluster nodes within 50 m into one station
function clusterNodes(nodes: OsmNode[]): OsmNode[] {
  const CLUSTER_KM = 0.05;
  const used = new Set<number>();
  const clusters: OsmNode[] = [];

  for (let i = 0; i < nodes.length; i++) {
    if (used.has(i)) continue;
    const group = [nodes[i]];
    used.add(i);
    for (let j = i + 1; j < nodes.length; j++) {
      if (!used.has(j) && distKm(nodes[i].lat, nodes[i].lng, nodes[j].lat, nodes[j].lng) <= CLUSTER_KM) {
        group.push(nodes[j]);
        used.add(j);
      }
    }
    // Representative point: first named one, or first with operator, or just first
    const rep = group.find(n => n.name) ?? group.find(n => n.operator) ?? group[0];
    clusters.push({
      lat: group.reduce((s, n) => s + n.lat, 0) / group.length,
      lng: group.reduce((s, n) => s + n.lng, 0) / group.length,
      name: rep.name,
      operator: rep.operator,
      address: rep.address,
      city: rep.city,
    });
  }
  return clusters;
}

const CONNECTOR_MAP: Record<string, string> = {
  "type2": "Tipo 2", "iec_62196_t2": "Tipo 2",
  "ccs": "CCS2", "iec_62196_t2_combo": "CCS2",
  "chademo": "CHAdeMO",
  "tesla_supercharger": "NACS", "tesla_standard": "NACS",
};

function parseConnectors(tags: Record<string, string>): string[] {
  const set = new Set<string>();
  for (const [k, v] of Object.entries(tags)) {
    if (k.startsWith("socket:")) {
      const t = k.replace("socket:", "").toLowerCase();
      const mapped = CONNECTOR_MAP[t];
      if (mapped) set.add(mapped);
    }
  }
  // fallback: check the plain socket tag
  const plain = (tags["socket"] ?? "").toLowerCase();
  if (CONNECTOR_MAP[plain]) set.add(CONNECTOR_MAP[plain]);
  return set.size ? [...set] : ["Tipo 2"];
}

type OverpassElement = {
  lat: number;
  lon: number;
  tags?: Record<string, string>;
};

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "DóndeCargar/1.0 (lopezjuandiego@gmail.com)",
      },
      body: `data=${encodeURIComponent(OVERPASS_QUERY)}`,
    });
    if (!res.ok) throw new Error(`Overpass ${res.status}`);

    const data = await res.json() as { elements: OverpassElement[] };
    const elements = data.elements ?? [];

    // Filter to Uruguay only and exclude known-Argentine coords
    const uyNodes: OsmNode[] = elements
      .filter((e) => {
        const { lat, lon: lng } = e;
        return (
          lat >= UY_LAT_MIN && lat <= UY_LAT_MAX &&
          lng >= UY_LNG_MIN && lng <= UY_LNG_MAX
        );
      })
      .map((e) => {
        const t = e.tags ?? {};
        const addr = [t["addr:street"], t["addr:housenumber"]].filter(Boolean).join(" ") || t["description"] || "";
        return {
          lat: e.lat,
          lng: e.lon,
          name: t["name"],
          operator: t["operator"],
          address: addr,
          city: t["addr:city"] ?? t["addr:suburb"] ?? "",
        };
      });

    const stations = clusterNodes(uyNodes);

    const sql = getDb();

    let inserted = 0, skipped = 0;
    for (const s of stations) {
      const operatorName = s.operator ?? "UTE";
      const stationName = s.name ?? `${operatorName} — Uruguay`;

      // WHERE NOT EXISTS makes each insert atomic — safe under concurrent cron runs
      const result = await sql`
        INSERT INTO "Station"
          (name, operator, address, city, province, lat, lng,
           "connectorTypes", "powerKw", "accessType", "isFree", source, "isVerified")
        SELECT
          ${stationName}, ${operatorName}, ${s.address}, ${s.city},
          'Uruguay', ${s.lat}, ${s.lng},
          ${JSON.stringify(["CCS2", "Tipo 2"])}, ${null},
          'public', false, 'osm_uy', false
        WHERE NOT EXISTS (
          SELECT 1 FROM "Station"
          WHERE ROUND(lat::numeric, 3) = ROUND(${s.lat}::numeric, 3)
            AND ROUND(lng::numeric, 3) = ROUND(${s.lng}::numeric, 3)
        )
        RETURNING id
      `;
      if (result.length > 0) inserted++;
      else skipped++;
    }

    return NextResponse.json({
      ok: true,
      inserted,
      skipped,
      raw_nodes: uyNodes.length,
      after_clustering: stations.length,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
