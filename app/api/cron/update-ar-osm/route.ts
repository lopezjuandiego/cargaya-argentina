import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const OVERPASS_QUERY = `
[out:json][timeout:90];
area["ISO3166-1"="AR"]->.ar;
node[amenity=charging_station](area.ar);
out;
`.trim();

const MANAGED_PREFIXES = ["ypf", "y.p.f.", "scame"];
function isManagedOperator(name: string | undefined): boolean {
  const n = (name ?? "").toLowerCase();
  return MANAGED_PREFIXES.some((p) => n.includes(p));
}

function distKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type OsmNode = {
  lat: number; lng: number;
  name?: string; operator?: string; address?: string; city?: string; province?: string;
};

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
    const rep = group.find(n => n.name) ?? group.find(n => n.operator) ?? group[0];
    clusters.push({
      lat: group.reduce((s, n) => s + n.lat, 0) / group.length,
      lng: group.reduce((s, n) => s + n.lng, 0) / group.length,
      name: rep.name, operator: rep.operator,
      address: rep.address, city: rep.city, province: rep.province,
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
      const mapped = CONNECTOR_MAP[k.replace("socket:", "").toLowerCase()];
      if (mapped) set.add(mapped);
    }
  }
  const plain = (tags["socket"] ?? "").toLowerCase();
  if (CONNECTOR_MAP[plain]) set.add(CONNECTOR_MAP[plain]);
  return set.size ? [...set] : ["Tipo 2"];
}

async function reverseGeocode(lat: number, lng: number): Promise<{ address: string; city: string; province: string }> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "DóndeCargar/1.0 (lopezjuandiego@gmail.com)" },
    });
    if (!res.ok) return { address: "", city: "", province: "" };
    const data = await res.json() as { address?: Record<string, string> };
    const a = data.address ?? {};
    const road = a["road"] ?? a["pedestrian"] ?? a["path"] ?? "";
    const num = a["house_number"] ?? "";
    const city = a["city"] ?? a["town"] ?? a["village"] ?? a["suburb"] ?? "";
    const province = (a["state"] ?? "").replace(/^Provincia de\s+/i, "").replace(/^Province of\s+/i, "").trim();
    return { address: [road, num].filter(Boolean).join(" "), city, province };
  } catch {
    return { address: "", city: "", province: "" };
  }
}

type OverpassElement = { lat: number; lon: number; tags?: Record<string, string> };

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

    const arNodes: OsmNode[] = elements
      .filter((e) => e.lat !== undefined && e.lon !== undefined)
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
          province: (t["addr:state"] ?? "").replace(/^Provincia de\s+/i, "").trim(),
        };
      });

    const stations = clusterNodes(arNodes);

    const sql = getDb();
    let inserted = 0, skipped = 0, managed = 0;

    for (const s of stations) {
      if (isManagedOperator(s.operator)) { managed++; continue; }

      let address = s.address ?? "";
      let city = s.city ?? "";
      let province = s.province ?? "";

      if (!address || !city || !province) {
        const geo = await reverseGeocode(s.lat, s.lng);
        if (!address) address = geo.address;
        if (!city) city = geo.city;
        if (!province) province = geo.province;
      }

      const operatorName = s.operator ?? "Desconocido";
      const stationName = s.name ?? operatorName;
      const connectors = parseConnectors({});

      const result = await sql`
        INSERT INTO "Station"
          (name, operator, address, city, province, lat, lng,
           "connectorTypes", "powerKw", "accessType", "isFree", source, "isVerified")
        SELECT
          ${stationName}, ${operatorName}, ${address}, ${city},
          ${province}, ${s.lat}, ${s.lng},
          ${JSON.stringify(connectors)}, ${null},
          'public', false, 'osm_ar', false
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
      managed_skipped: managed,
      raw_nodes: arNodes.length,
      after_clustering: stations.length,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
