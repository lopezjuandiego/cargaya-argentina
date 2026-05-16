import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envContent = readFileSync(join(__dirname, "../.env.local"), "utf8");
for (const line of envContent.split("\n")) {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) process.env[key.trim()] = rest.join("=").trim().replace(/^"|"$/g, "");
}

const sql = neon(process.env.DATABASE_URL);

async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ", Argentina")}&format=json&limit=1&countrycodes=ar`;
  const res = await fetch(url, { headers: { "User-Agent": "DóndeCargar/1.0" } });
  const data = await res.json();
  if (!data.length) return null;
  await new Promise(r => setTimeout(r, 1100)); // Nominatim rate limit
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

const stations = [
  {
    name: "Axion Energy Av. Córdoba",
    operator: "AXION Energy",
    address: "Av. Córdoba 5653",
    city: "CABA",
    province: "Buenos Aires",
    connectorTypes: ["CCS2", "Tipo 2"],
    powerKw: 50,
    isFree: false,
    category: "Estación de servicio",
    accessType: "public",
    source: "evtron",
    notes: "Axion Energy. 24 hs.",
    geocodeQuery: "Avenida Córdoba 5653 Buenos Aires Argentina",
  },
  {
    name: "DS Store CABA",
    operator: "DS Store",
    address: "Av. Congreso 1550",
    city: "CABA",
    province: "Buenos Aires",
    connectorTypes: ["Tipo 2"],
    powerKw: 7,
    isFree: false,
    category: "Concesionaria",
    accessType: "public",
    source: "evtron",
    notes: "Concesionaria DS. Horario 10:00 a 19:00.",
    geocodeQuery: "Avenida Congreso 1550 Buenos Aires Argentina",
  },
  {
    name: "DS Store Córdoba",
    operator: "DS Store",
    address: "Av. Colón 4546",
    city: "Córdoba",
    province: "Córdoba",
    connectorTypes: ["Tipo 2"],
    powerKw: 7,
    isFree: false,
    category: "Concesionaria",
    accessType: "public",
    source: "evtron",
    notes: "Concesionaria DS. Horario 10:00 a 19:00.",
    geocodeQuery: "Avenida Colón 4546 Córdoba Argentina",
  },
  {
    name: "DS Store Rosario",
    operator: "DS Store",
    address: "Santa Fe 1539",
    city: "Rosario",
    province: "Santa Fe",
    connectorTypes: ["Tipo 2"],
    powerKw: 7,
    isFree: false,
    category: "Concesionaria",
    accessType: "public",
    source: "evtron",
    notes: "Concesionaria DS. Horario 10:00 a 19:00.",
    geocodeQuery: "Santa Fe 1539 Rosario Santa Fe Argentina",
  },
  {
    name: "Parque Mitre Godoy Cruz",
    operator: "Scame",
    address: "Lencinas 550",
    city: "Godoy Cruz",
    province: "Mendoza",
    connectorTypes: ["Tipo 2"],
    powerKw: 22,
    isFree: false,
    category: "Parking",
    accessType: "public",
    source: "evtron",
    notes: "Parque Mitre. Cargador Tipo 2.",
    geocodeQuery: "Lencinas 550 Godoy Cruz Mendoza Argentina",
  },
  {
    name: "Hotel Fuente Mayor UCO",
    operator: "Hotel",
    address: "Ruta Provincial 92 s/n",
    city: "Vista Flores",
    province: "Mendoza",
    connectorTypes: ["Tipo 2"],
    powerKw: 7,
    isFree: false,
    category: "Hotel",
    accessType: "public",
    source: "evtron",
    notes: "Hotel Fuente Mayor UCO, Tunuyán. Cargador Tipo 2.",
    geocodeQuery: "Vista Flores Tunuyán Mendoza Argentina",
  },
  {
    name: "Hotel La Bora",
    operator: "Hotel",
    address: "Tte. Ramayón 840",
    city: "San Martín de los Andes",
    province: "Neuquén",
    connectorTypes: ["Tipo 2"],
    powerKw: 7,
    isFree: false,
    category: "Hotel",
    accessType: "public",
    source: "evtron",
    notes: "Hotel La Bora. Horario 8:00 a 20:00.",
    geocodeQuery: "Teniente Ramayón 840 San Martín de los Andes Neuquén Argentina",
  },
  {
    name: "Hotel Las Balsas",
    operator: "Hotel",
    address: "Cabellera de la Berenice 445",
    city: "Villa La Angostura",
    province: "Neuquén",
    connectorTypes: ["Tipo 2"],
    powerKw: 7,
    isFree: false,
    category: "Hotel",
    accessType: "public",
    source: "evtron",
    notes: "Hotel Las Balsas Relais Châteaux. Horario 8:00 a 20:00.",
    geocodeQuery: "Villa La Angostura Neuquén Argentina",
  },
  {
    name: "McDonald's Santiago del Estero",
    operator: "McDonald's",
    address: "Av. Belgrano Sur 2663",
    city: "Santiago del Estero",
    province: "Santiago del Estero",
    connectorTypes: ["Tipo 2"],
    powerKw: 22,
    isFree: false,
    category: "Restaurante",
    accessType: "public",
    source: "evtron",
    notes: "McDonald's. Cargador AC 22 kW.",
    geocodeQuery: "Avenida Belgrano Sur 2663 Santiago del Estero Argentina",
  },
];

async function run() {
  let inserted = 0;
  let skipped = 0;

  for (const s of stations) {
    // Check if already exists
    const existing = await sql`
      SELECT id FROM "Station"
      WHERE address ILIKE ${s.address} AND city ILIKE ${s.city}
      LIMIT 1
    `;
    if (existing.length > 0) {
      console.log(`⏭  Ya existe: ${s.name} (${s.city})`);
      skipped++;
      continue;
    }

    console.log(`🌍 Geocodificando: ${s.name}...`);
    const geo = await geocode(s.geocodeQuery);
    if (!geo) {
      console.log(`❌ No se pudo geocodificar: ${s.name}`);
      continue;
    }

    await sql`
      INSERT INTO "Station" (
        name, operator, address, city, province,
        lat, lng, "connectorTypes", "powerKw",
        "isFree", category, "accessType", source, notes,
        "isVerified", "createdAt", "updatedAt"
      ) VALUES (
        ${s.name}, ${s.operator}, ${s.address}, ${s.city}, ${s.province},
        ${geo.lat}, ${geo.lng}, ${JSON.stringify(s.connectorTypes)}, ${s.powerKw},
        ${s.isFree}, ${s.category}, ${s.accessType}, ${s.source}, ${s.notes},
        false, NOW(), NOW()
      )
    `;
    console.log(`✅ Insertada: ${s.name} (${s.city}) — ${geo.lat}, ${geo.lng}`);
    inserted++;
  }

  console.log(`\nResumen: ${inserted} insertadas, ${skipped} ya existían`);

  const total = await sql`SELECT COUNT(*)::int AS n FROM "Station"`;
  console.log(`Total en DB: ${total[0].n}`);
}

run().catch(console.error);
