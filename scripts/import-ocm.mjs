/**
 * Importa estaciones desde Open Charge Map (OCM) a Neon Postgres.
 * Uso:
 *   DATABASE_URL="postgres://..." OCM_API_KEY="tu-key" node scripts/import-ocm.mjs
 *
 * API key gratis en: https://openchargemap.io/site/develop/index
 */

import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const OCM_API_KEY = process.env.OCM_API_KEY;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL no está definido.");
  console.error("   Copiá la connection string desde https://console.neon.tech y pasala así:");
  console.error('   DATABASE_URL="postgres://..." OCM_API_KEY="..." node scripts/import-ocm.mjs');
  process.exit(1);
}

if (!OCM_API_KEY) {
  console.error("❌ OCM_API_KEY no está definido.");
  console.error("   Obtenés una key gratis en: https://openchargemap.io/site/develop/index");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// Tipos de conector OCM → nombre interno
const CONNECTOR_MAP = {
  "Type 1 (J1772)": "Tipo 1",
  "SAE J1772": "Tipo 1",
  "Type 2 (Socket Only)": "Tipo 2",
  "Type 2 (Tethered Connector)": "Tipo 2",
  "IEC 62196-2 Type 2 (Mennekes)": "Tipo 2",
  "Type 2 Outlet": "Tipo 2",
  "CHAdeMO": "CHAdeMO",
  "CCS (Type 2)": "CCS2",
  "CCS (SAE J1772-2009)": "CCS2",
  "IEC 62196-2 CCS": "CCS2",
  "CCS (Combo 2)": "CCS2",
  "CCS (Combo 1)": "CCS1",
  "Tesla Roadster (Roadster)": "Tesla",
  "Tesla Supercharger": "Tesla SC",
  "NACS / SAE J3400": "NACS",
  "Type 3C (Scame)": "Tipo 3",
  "Type 3A": "Tipo 3",
};

// Nombres de provincias OCM → nombre normalizado
const PROVINCE_MAP = {
  "Ciudad Autónoma de Buenos Aires": "Buenos Aires",
  "Ciudad de Buenos Aires": "Buenos Aires",
  "CABA": "Buenos Aires",
  "Buenos Aires Province": "Buenos Aires",
  "Buenos Aires": "Buenos Aires",
  "Córdoba": "Córdoba",
  "Cordoba": "Córdoba",
  "Santa Fe": "Santa Fe",
  "Mendoza": "Mendoza",
  "Neuquén": "Neuquén",
  "Neuquen": "Neuquén",
  "Río Negro": "Río Negro",
  "Rio Negro": "Río Negro",
  "Chubut": "Chubut",
  "Santa Cruz": "Santa Cruz",
  "Tierra del Fuego": "Tierra del Fuego",
  "Salta": "Salta",
  "Jujuy": "Jujuy",
  "Tucumán": "Tucumán",
  "Tucuman": "Tucumán",
  "Misiones": "Misiones",
  "Entre Ríos": "Entre Ríos",
  "Entre Rios": "Entre Ríos",
  "Corrientes": "Corrientes",
  "Formosa": "Formosa",
  "Chaco": "Chaco",
  "La Rioja": "La Rioja",
  "Santiago del Estero": "Santiago del Estero",
  "Catamarca": "Catamarca",
  "San Juan": "San Juan",
  "San Luis": "San Luis",
  "La Pampa": "La Pampa",
};

async function fetchOCMPage(offset) {
  const url = new URL("https://api.openchargemap.io/v3/poi/");
  url.searchParams.set("key", OCM_API_KEY);
  url.searchParams.set("countrycode", "AR");
  url.searchParams.set("maxresults", "500");
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("compact", "false");
  url.searchParams.set("verbose", "false");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "CargaYa/1.0 (contacto@cargaya.com.ar)" },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OCM API ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

function mapConnectors(connections) {
  if (!connections?.length) return [];
  const types = new Set();
  for (const c of connections) {
    const title = c.ConnectionType?.Title ?? "";
    const mapped = CONNECTOR_MAP[title];
    if (mapped) {
      types.add(mapped);
    } else if (title.includes("CCS")) {
      types.add("CCS2");
    } else if (title.includes("CHAdeMO")) {
      types.add("CHAdeMO");
    } else if (title.includes("Type 2")) {
      types.add("Tipo 2");
    } else if (title.includes("Type 1")) {
      types.add("Tipo 1");
    }
  }
  return [...types];
}

function maxPowerKw(connections) {
  if (!connections?.length) return null;
  const powers = connections.map((c) => c.PowerKW).filter(Boolean);
  return powers.length ? Math.max(...powers) : null;
}

function normalizeCity(town, province) {
  if (
    province === "Buenos Aires" &&
    (town?.toLowerCase().includes("buenos aires") || town?.toLowerCase() === "caba")
  ) {
    return "CABA";
  }
  return town ?? "";
}

async function main() {
  console.log("🔌 Importador OCM → CargaYa\n");

  console.log("Leyendo estaciones existentes...");
  const existing = await sql`SELECT lat, lng FROM "Station"`;
  const existingCoords = new Set(
    existing.map((s) => `${s.lat.toFixed(3)},${s.lng.toFixed(3)}`)
  );
  console.log(`  ${existing.length} estaciones en la DB\n`);

  let offset = 0;
  let totalFetched = 0;
  let totalInserted = 0;
  let totalDuplicates = 0;
  let totalInvalid = 0;

  while (true) {
    console.log(`Descargando OCM offset=${offset}...`);
    const stations = await fetchOCMPage(offset);

    if (!stations.length) {
      console.log("Sin más resultados.");
      break;
    }

    totalFetched += stations.length;
    console.log(`  ${stations.length} recibidas`);

    for (const s of stations) {
      const addr = s.AddressInfo;
      if (!addr?.Latitude || !addr?.Longitude) {
        totalInvalid++;
        continue;
      }

      const lat = addr.Latitude;
      const lng = addr.Longitude;
      const coordKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;

      if (existingCoords.has(coordKey)) {
        totalDuplicates++;
        continue;
      }

      const rawProvince = addr.StateOrProvince ?? "";
      const province = PROVINCE_MAP[rawProvince] ?? rawProvince;
      const city = normalizeCity(addr.Town, province);
      const connectorTypes = mapConnectors(s.Connections);
      const powerKw = maxPowerKw(s.Connections);
      const isFree =
        s.UsageType?.Title?.toLowerCase().includes("free") ?? false;
      const operator = s.OperatorInfo?.Title ?? "Desconocido";
      const name = addr.Title ?? operator;
      const address = addr.AddressLine1 ?? "";
      const postalCode = addr.Postcode ?? null;
      const notes = s.GeneralComments ?? null;

      try {
        await sql`
          INSERT INTO "Station"
            (name, operator, address, city, province, "postalCode", lat, lng,
             "connectorTypes", "powerKw", "accessType", "isFree", source, "isVerified", notes)
          VALUES
            (${name}, ${operator}, ${address}, ${city}, ${province}, ${postalCode},
             ${lat}, ${lng}, ${JSON.stringify(connectorTypes)}, ${powerKw},
             'public', ${isFree}, 'ocm', true, ${notes})
        `;
        existingCoords.add(coordKey);
        totalInserted++;
        console.log(`  ✓ ${name} (${city}, ${province})`);
      } catch (e) {
        console.error(`  ✗ Error insertando "${name}": ${e.message}`);
        totalInvalid++;
      }
    }

    if (stations.length < 500) break;
    offset += 500;

    // Pausa entre páginas para no saturar la API
    await new Promise((r) => setTimeout(r, 1200));
  }

  const [{ n }] = await sql`SELECT COUNT(*) as n FROM "Station"`;

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Importación completa
   Descargadas de OCM:  ${totalFetched}
   Insertadas nuevas:   ${totalInserted}
   Duplicadas (skip):   ${totalDuplicates}
   Inválidas (skip):    ${totalInvalid}
   Total en DB ahora:   ${n}
━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
