/**
 * Importa estaciones YPF Punto Eléctrico desde la API oficial de mapa.ypf.com
 *
 * Uso:
 *   DATABASE_URL="postgres://..." node scripts/scrape-ypf.mjs
 *
 * Sin DATABASE_URL solo imprime las estaciones encontradas.
 */

import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const API_URL = "https://magui.ypf.com/ypfcom/api/PublicEESS";

const CONNECTOR_MAP = {
  TYPE2: "Tipo 2",
  CHADEMO: "CHAdeMO",
  TYPE2CCS: "CCS2",
  CCS: "CCS2",
  CCS2: "CCS2",
  NACS: "NACS",
  TYPE1: "Tipo 1",
};

function parseCity(localidad) {
  // "Villalonga (Buenos Aires)" -> "Villalonga"
  return localidad.replace(/\s*\(.*\)$/, "").trim();
}

function mapConnectors(puntoElectrico) {
  if (!Array.isArray(puntoElectrico)) return [];
  const types = new Set();
  for (const charger of puntoElectrico) {
    for (const c of charger.conectores ?? []) {
      const mapped = CONNECTOR_MAP[c.tipo_conector?.toUpperCase()];
      if (mapped) types.add(mapped);
    }
  }
  return [...types];
}

function maxPowerKw(puntoElectrico) {
  if (!Array.isArray(puntoElectrico)) return null;
  let max = 0;
  for (const charger of puntoElectrico) {
    for (const c of charger.conectores ?? []) {
      const w = parseFloat(c.max_potencia);
      if (w > max) max = w;
    }
  }
  return max > 0 ? max / 1000 : null;
}

async function fetchStations() {
  console.log("Descargando datos desde API YPF...");
  const res = await fetch(API_URL, {
    headers: {
      Referer: "https://mapa.ypf.com/",
      Origin: "https://mapa.ypf.com",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

  const all = await res.json();
  console.log(`Total estaciones YPF: ${all.length}`);

  const ev = all.filter((s) => s.CARGADOR_ELECTRICO === "SI");
  console.log(`Con cargador eléctrico: ${ev.length}`);

  return ev.map((s) => ({
    name: "YPF Punto Eléctrico",
    operator: "YPF",
    address: s.DIRECCION ?? "",
    city: parseCity(s.LOCALIDAD_GEOGRAFICA ?? ""),
    province: s.PROVINCIA_GEOGRAFICA ?? "",
    lat: s.POINT_Y,
    lng: s.POINT_X,
    connectorTypes: mapConnectors(s.PUNTO_ELECTRICO),
    powerKw: maxPowerKw(s.PUNTO_ELECTRICO),
    isFree: false,
    source: "ypf",
    externalId: String(s.APIES),
  }));
}

async function importToDB(stations) {
  if (!DATABASE_URL || stations.length === 0) return;

  const sql = neon(DATABASE_URL);

  console.log("\nImportando a la DB...");
  const existing = await sql`SELECT lat, lng FROM "Station" WHERE source = 'ypf'`;
  const existingCoords = new Set(
    existing.map((s) => `${parseFloat(s.lat).toFixed(3)},${parseFloat(s.lng).toFixed(3)}`)
  );

  let inserted = 0;
  let skipped = 0;

  for (const s of stations) {
    const coordKey = `${s.lat.toFixed(3)},${s.lng.toFixed(3)}`;
    if (existingCoords.has(coordKey)) {
      skipped++;
      continue;
    }

    try {
      await sql`
        INSERT INTO "Station"
          (name, operator, address, city, province, lat, lng,
           "connectorTypes", "powerKw", "accessType", "isFree", source, "isVerified")
        VALUES
          (${s.name}, ${s.operator}, ${s.address}, ${s.city}, ${s.province},
           ${s.lat}, ${s.lng}, ${JSON.stringify(s.connectorTypes)}, ${s.powerKw},
           'public', ${s.isFree}, ${s.source}, true)
      `;
      existingCoords.add(coordKey);
      inserted++;
      console.log(`  + ${s.city}, ${s.province} | ${s.connectorTypes.join(", ")} | ${s.powerKw ?? "?"}kW`);
    } catch (e) {
      console.error(`  ✗ ${s.city}: ${e.message}`);
    }
  }

  const [{ n }] = await sql`SELECT COUNT(*) as n FROM "Station"`;
  console.log(`\nInsertadas: ${inserted} | Omitidas: ${skipped} | Total en DB: ${n}`);
}

async function main() {
  const stations = await fetchStations();

  console.log(`\n${stations.length} estaciones YPF con cargador:`);
  for (const s of stations) {
    const types = s.connectorTypes.length ? s.connectorTypes.join(", ") : "(sin datos)";
    console.log(`  ${s.city}, ${s.province} | ${types} | ${s.powerKw ?? "?"}kW | ${s.lat},${s.lng}`);
  }

  await importToDB(stations);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
