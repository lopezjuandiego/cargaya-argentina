/**
 * Importa estaciones Scame desde Google My Maps (KML público).
 * Sin Playwright, sin API key — KML descargable directo.
 *
 * Uso:
 *   DATABASE_URL="postgres://..." node scripts/import-scame.mjs
 *
 * Sin DATABASE_URL solo imprime las estaciones encontradas.
 */

import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const KML_URL = "https://www.google.com/maps/d/kml?mid=1vawftpdlPBLTwycgkrxXbRoobwBM50k&forcekml=1";

function extractTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, "i"));
  return m ? m[1].trim() : "";
}

function extractCDATA(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\/${tag}>`, "i"));
  if (m) return m[1].trim();
  return extractTag(xml, tag);
}

function extractDataValue(xml, name) {
  const blockRe = new RegExp(`<Data name="${name}">[\\s\\S]*?<value>([\\s\\S]*?)<\\/value>[\\s\\S]*?<\\/Data>`, "i");
  const m = xml.match(blockRe);
  return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "";
}

function parseConnectors(text) {
  const types = new Set();
  if (/cc2|ccs2|ccs\s*2|combo/i.test(text)) types.add("CCS2");
  if (/chademo|chd/i.test(text)) types.add("CHAdeMO");
  if (/tipo\s*2|type\s*2|t2|ac\s*22|22\s*kw/i.test(text)) types.add("Tipo 2");
  return [...types];
}

function parsePower(text) {
  const m = text.match(/(\d+[\.,]?\d*)\s*kw/i);
  return m ? parseFloat(m[1].replace(",", ".")) : null;
}

function parseAddress(desc) {
  const lines = desc.split(/[\n|]/).map(l => l.replace(/^-\s*/, "").trim()).filter(Boolean);
  const addrLine = lines.find(l => /^\w/.test(l) && l.length > 10);
  if (!addrLine) return { address: "", city: "", province: "" };

  const parts = addrLine.split(",").map(s => s.trim());
  const address = parts[0] ?? "";
  const cityRaw = parts[1] ?? "";
  const province = parts[2] ?? "";

  // Strip postal codes from city (e.g. "T4107 Yerba Buena" → "Yerba Buena")
  const city = cityRaw.replace(/^[A-Z]\d{4}\s*/, "").replace(/\d+\s*/g, "").trim() || cityRaw;

  return { address, city, province };
}

async function fetchStations() {
  console.log("Descargando KML Scame desde Google My Maps...");
  const res = await fetch(KML_URL, {
    headers: { "User-Agent": "CargaYa/1.0 (lopezjuandiego@gmail.com)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const kml = await res.text();

  const blocks = kml.split(/<Placemark[\s>]/i).slice(1);
  console.log(`Placemarks encontrados: ${blocks.length}`);

  const stations = [];
  for (const block of blocks) {
    const coordsRaw = extractTag(block, "coordinates");
    if (!coordsRaw) continue;

    const [lngStr, latStr] = coordsRaw.trim().split(",");
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    if (isNaN(lat) || isNaN(lng)) continue;
    if (lat > -20 || lat < -55 || lng < -75 || lng > -50) continue; // Argentina bounds

    const rawName = extractTag(block, "name");
    const name = rawName.replace(/\s*\|\s*(Powered|Poered) by Scame/i, "").trim() || "Scame";
    const desc = extractDataValue(block, "Descripción");
    const fullText = rawName + " " + desc;

    const { address, city, province } = parseAddress(desc);
    const connectors = parseConnectors(fullText);
    const powerKw = parsePower(desc);

    const isPrivate = /uso exclusivo|exclusivo\s+(empleados|propietarios|visitas|huespedes)/i.test(desc);

    stations.push({
      name: `Scame — ${name}`,
      operator: "Scame",
      address,
      city,
      province,
      lat,
      lng,
      connectorTypes: connectors.length ? connectors : ["Tipo 2"],
      powerKw,
      isFree: !isPrivate,
      accessType: isPrivate ? "restricted" : "public",
      source: "scame",
    });
  }

  return stations;
}

async function importToDB(stations) {
  if (!DATABASE_URL || stations.length === 0) return;

  const sql = neon(DATABASE_URL);

  console.log("\nImportando a la DB...");
  const existing = await sql`SELECT lat, lng FROM "Station" WHERE source = 'scame'`;
  const existingCoords = new Set(
    existing.map(s => `${parseFloat(s.lat).toFixed(3)},${parseFloat(s.lng).toFixed(3)}`)
  );

  let inserted = 0, skipped = 0;

  for (const s of stations) {
    const key = `${s.lat.toFixed(3)},${s.lng.toFixed(3)}`;
    if (existingCoords.has(key)) { skipped++; continue; }

    try {
      await sql`
        INSERT INTO "Station"
          (name, operator, address, city, province, lat, lng,
           "connectorTypes", "powerKw", "accessType", "isFree", source, "isVerified")
        VALUES
          (${s.name}, ${s.operator}, ${s.address}, ${s.city}, ${s.province},
           ${s.lat}, ${s.lng}, ${JSON.stringify(s.connectorTypes)}, ${s.powerKw},
           ${s.accessType}, ${s.isFree}, ${s.source}, true)
      `;
      existingCoords.add(key);
      inserted++;
      const priv = s.accessType === "restricted" ? " [privado]" : "";
      console.log(`  + ${s.name} | ${s.city || "?"}, ${s.province || "?"}${priv}`);
    } catch (e) {
      console.error(`  ✗ ${s.name}: ${e.message}`);
    }
  }

  const [{ n }] = await sql`SELECT COUNT(*) as n FROM "Station"`;
  console.log(`\nInsertadas: ${inserted} | Omitidas: ${skipped} | Total en DB: ${n}`);
}

async function main() {
  const stations = await fetchStations();

  const pub = stations.filter(s => s.accessType === "public").length;
  const priv = stations.filter(s => s.accessType === "restricted").length;
  console.log(`\nEstaciones Scame: ${stations.length} total (${pub} públicas, ${priv} restringidas)`);
  for (const s of stations) {
    const priv = s.accessType === "restricted" ? " [privado]" : "";
    console.log(`  ${s.name}${priv} | ${s.city || "?"}, ${s.province || "?"} | ${s.connectorTypes.join(", ")} | lat:${s.lat}`);
  }

  await importToDB(stations);
}

main().catch(e => { console.error(e); process.exit(1); });
