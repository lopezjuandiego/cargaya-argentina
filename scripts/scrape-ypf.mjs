/**
 * Scraper para estaciones YPF Punto Eléctrico desde mapa.ypf.com
 *
 * Prerequisitos (WSL/Ubuntu):
 *   sudo apt install -y libnspr4 libnss3 libatk1.0-0 libgtk-3-0 libgbm1 libasound2
 *   npm install playwright
 *   npx playwright install chromium
 *
 * Uso:
 *   DATABASE_URL="postgres://..." node scripts/scrape-ypf.mjs
 *
 * Sin DATABASE_URL solo imprime las estaciones encontradas.
 */

import { chromium } from "playwright";
import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;

// Esperar N ms
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function scrapeYPF() {
  console.log("🔌 Scraper YPF Punto Eléctrico\n");

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    locale: "es-AR",
    timezoneId: "America/Argentina/Buenos_Aires",
  });

  const capturedStations = [];
  const capturedUrls = new Set();

  // Interceptar todas las respuestas JSON que parezcan datos de estaciones
  context.on("response", async (response) => {
    const url = response.url();
    const contentType = response.headers()["content-type"] ?? "";

    if (!contentType.includes("application/json")) return;
    if (capturedUrls.has(url)) return;

    // Filtrar por URLs que parezcan APIs de estaciones
    const isStationApi =
      url.includes("station") ||
      url.includes("estacion") ||
      url.includes("poi") ||
      url.includes("marker") ||
      url.includes("point") ||
      url.includes("lugar") ||
      url.includes("location") ||
      url.includes("api/") ||
      url.includes("/v1/") ||
      url.includes("/v2/") ||
      url.includes("mapa.ypf.com");

    if (!isStationApi && !url.includes("ypf")) return;

    capturedUrls.add(url);

    try {
      const body = await response.json();
      console.log(`  📡 API capturada: ${url.slice(0, 120)}`);

      // Intentar extraer estaciones del body
      const stations = extractStations(body, url);
      if (stations.length > 0) {
        console.log(`     → ${stations.length} estaciones`);
        capturedStations.push(...stations);
      } else {
        console.log(`     → (estructura desconocida, guardando para análisis)`);
        console.log(`     Muestra: ${JSON.stringify(body).slice(0, 200)}`);
      }
    } catch {
      // ignorar respuestas no-JSON
    }
  });

  const page = await context.newPage();

  // Primera visita para obtener cookies/sesión
  console.log("Abriendo mapa.ypf.com...");
  try {
    await page.goto("https://mapa.ypf.com/", {
      waitUntil: "networkidle",
      timeout: 30000,
    });
  } catch {
    console.log("  Timeout esperado en networkidle, continuando...");
  }

  await wait(3000);

  // Navegar con filtro de carga eléctrica
  console.log("Aplicando filtro de carga eléctrica...");
  try {
    await page.goto("https://mapa.ypf.com/?filter=carga", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
  } catch {
    // ignorar timeout
  }

  await wait(5000);

  // Intentar hacer scroll en el mapa para disparar carga de más markers
  try {
    // Buscar el elemento del mapa
    const mapEl = await page.$("[id*='map'], [class*='map'], canvas, .leaflet-container");
    if (mapEl) {
      const box = await mapEl.boundingBox();
      if (box) {
        // Simular scroll/pan en el mapa para cargar todo Argentina
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.wheel(0, 200);
        await wait(2000);
        await page.mouse.wheel(0, -400);
        await wait(2000);
      }
    }
  } catch {
    // ignorar errores de interacción
  }

  // Esperar a que se carguen los datos
  await wait(5000);

  // Intentar hacer click en botones de filtro de carga eléctrica
  try {
    const buttons = await page.$$("button, a");
    for (const btn of buttons) {
      const text = await btn.textContent().catch(() => "");
      if (
        text.toLowerCase().includes("carg") ||
        text.toLowerCase().includes("electr") ||
        text.toLowerCase().includes("punto")
      ) {
        console.log(`  Haciendo click en: "${text.trim()}"`);
        await btn.click().catch(() => {});
        await wait(2000);
        break;
      }
    }
  } catch {
    // ignorar
  }

  await wait(5000);

  // También intentar con el endpoint de producción directamente
  console.log("\nIntentando endpoint directo...");
  const endpointsToTry = [
    "https://mapa.ypf.com/api/stations",
    "https://mapa.ypf.com/api/estaciones",
    "https://mapa.ypf.com/api/v1/stations",
    "https://mapa.ypf.com/api/markers",
    "https://mapa.ypf.com/stations.json",
    "https://mapa.ypf.com/api/pois?type=carga",
  ];

  for (const ep of endpointsToTry) {
    try {
      const res = await page.evaluate(async (url) => {
        const r = await fetch(url);
        if (r.ok) return r.text();
        return null;
      }, ep);

      if (res) {
        console.log(`  ✅ Endpoint encontrado: ${ep}`);
        console.log(`  Respuesta: ${res.slice(0, 300)}`);
        try {
          const data = JSON.parse(res);
          const stations = extractStations(data, ep);
          capturedStations.push(...stations);
        } catch {
          // no era JSON
        }
      }
    } catch {
      // ignorar
    }
  }

  await browser.close();

  return capturedStations;
}

/**
 * Intenta extraer estaciones de diferentes formatos de respuesta JSON
 */
function extractStations(data, url) {
  const results = [];

  // Si es array directo
  if (Array.isArray(data)) {
    for (const item of data) {
      const s = parseStation(item);
      if (s) results.push(s);
    }
    return results;
  }

  // Si tiene propiedad "data", "stations", "estaciones", "results", "features"
  const keys = ["data", "stations", "estaciones", "results", "features", "items", "pois", "markers"];
  for (const key of keys) {
    if (Array.isArray(data[key])) {
      for (const item of data[key]) {
        const s = parseStation(item);
        if (s) results.push(s);
      }
      if (results.length > 0) return results;
    }
  }

  // GeoJSON FeatureCollection
  if (data.type === "FeatureCollection" && Array.isArray(data.features)) {
    for (const feature of data.features) {
      const s = parseGeoJSONFeature(feature);
      if (s) results.push(s);
    }
  }

  return results;
}

function parseStation(item) {
  if (!item || typeof item !== "object") return null;

  // Coordenadas en varios formatos posibles
  const lat =
    item.lat ?? item.latitude ?? item.Latitude ?? item.y ?? item.coordinates?.lat ?? item.position?.lat;
  const lng =
    item.lng ?? item.lon ?? item.longitude ?? item.Longitude ?? item.x ?? item.coordinates?.lng ?? item.position?.lng;

  if (!lat || !lng) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  // Argentina bounds roughly
  if (lat > -20 || lat < -55 || lng < -75 || lng > -50) return null;

  return {
    name: item.name ?? item.nombre ?? item.title ?? item.Title ?? "YPF Punto Eléctrico",
    operator: "YPF",
    address: item.address ?? item.direccion ?? item.AddressLine1 ?? "",
    city: item.city ?? item.ciudad ?? item.Town ?? item.town ?? "",
    province: item.province ?? item.provincia ?? item.StateOrProvince ?? "",
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    powerKw: item.power ?? item.potencia ?? item.powerKW ?? item.kw ?? null,
    connectorTypes: item.connectors ?? item.conectores ?? ["CCS2"],
    isFree: false,
    source: "ypf",
  };
}

function parseGeoJSONFeature(feature) {
  if (!feature?.geometry?.coordinates) return null;
  const [lng, lat] = feature.geometry.coordinates;
  const props = feature.properties ?? {};

  return {
    name: props.name ?? props.nombre ?? props.title ?? "YPF Punto Eléctrico",
    operator: "YPF",
    address: props.address ?? props.direccion ?? "",
    city: props.city ?? props.ciudad ?? "",
    province: props.province ?? props.provincia ?? "",
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    powerKw: props.power ?? props.powerKW ?? null,
    connectorTypes: props.connectors ?? ["CCS2"],
    isFree: false,
    source: "ypf",
  };
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
      console.log(`  ✓ ${s.name} (${s.city})`);
    } catch (e) {
      console.error(`  ✗ ${s.name}: ${e.message}`);
    }
  }

  const [{ n }] = await sql`SELECT COUNT(*) as n FROM "Station"`;
  console.log(`\n✅ Insertadas: ${inserted} | Omitidas: ${skipped} | Total en DB: ${n}`);
}

async function main() {
  const stations = await scrapeYPF();

  if (stations.length === 0) {
    console.log("\n⚠️  No se encontraron estaciones.");
    console.log("   Probablemente mapa.ypf.com requiere sesión autenticada o el endpoint no se detectó.");
    console.log("   Revisá la lista de URLs interceptadas arriba para identificar el endpoint manualmente.");
  } else {
    console.log(`\n🔌 ${stations.length} estaciones encontradas:`);
    for (const s of stations) {
      console.log(`  - ${s.name} | ${s.city}, ${s.province} | ${s.lat}, ${s.lng}`);
    }

    await importToDB(stations);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
