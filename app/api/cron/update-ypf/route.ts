import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const YPF_API = "https://magui.ypf.com/ypfcom/api/PublicEESS";

const CONNECTOR_MAP: Record<string, string> = {
  TYPE2: "Tipo 2", CHADEMO: "CHAdeMO", TYPE2CCS: "CCS2",
  CCS: "CCS2", CCS2: "CCS2", NACS: "NACS", TYPE1: "Tipo 1",
};

function parseCity(loc: string) {
  return loc.replace(/\s*\(.*\)$/, "").trim();
}

function mapConnectors(puntos: unknown[]): string[] {
  if (!Array.isArray(puntos)) return [];
  const types = new Set<string>();
  for (const charger of puntos as { conectores?: { tipo_conector?: string }[] }[]) {
    for (const c of charger.conectores ?? []) {
      const mapped = CONNECTOR_MAP[(c.tipo_conector ?? "").toUpperCase()];
      if (mapped) types.add(mapped);
    }
  }
  return [...types];
}

function maxPower(puntos: unknown[]): number | null {
  if (!Array.isArray(puntos)) return null;
  let max = 0;
  for (const charger of puntos as { conectores?: { max_potencia?: string }[] }[]) {
    for (const c of charger.conectores ?? []) {
      const w = parseFloat(c.max_potencia ?? "0");
      if (w > max) max = w;
    }
  }
  return max > 0 ? max / 1000 : null;
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(YPF_API, {
      headers: {
        Referer: "https://mapa.ypf.com/",
        Origin: "https://mapa.ypf.com",
        "User-Agent": "Mozilla/5.0 DóndeCargar/1.0",
      },
    });
    if (!res.ok) throw new Error(`YPF API ${res.status}`);

    const all = await res.json() as Record<string, unknown>[];
    const ev = all.filter((s) => s.CARGADOR_ELECTRICO === "SI");

    const sql = getDb();
    const existing = await sql`SELECT lat, lng FROM "Station" WHERE source = 'ypf'`;
    const existingSet = new Set(existing.map((s) =>
      `${parseFloat(String(s.lat)).toFixed(3)},${parseFloat(String(s.lng)).toFixed(3)}`
    ));

    let inserted = 0, skipped = 0;
    for (const s of ev) {
      const lat = s.POINT_Y as number;
      const lng = s.POINT_X as number;
      const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
      if (existingSet.has(key)) { skipped++; continue; }

      const connectors = mapConnectors(s.PUNTO_ELECTRICO as unknown[]);
      const powerKw = maxPower(s.PUNTO_ELECTRICO as unknown[]);

      await sql`
        INSERT INTO "Station"
          (name, operator, address, city, province, lat, lng,
           "connectorTypes", "powerKw", "accessType", "isFree", source, "isVerified")
        VALUES
          ('YPF Punto Eléctrico', 'YPF', ${s.DIRECCION ?? ""}, ${parseCity(String(s.LOCALIDAD_GEOGRAFICA ?? ""))},
           ${s.PROVINCIA_GEOGRAFICA ?? ""}, ${lat}, ${lng},
           ${JSON.stringify(connectors)}, ${powerKw}, 'public', false, 'ypf', true)
      `;
      existingSet.add(key);
      inserted++;
    }

    return NextResponse.json({ ok: true, inserted, skipped, total: ev.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
