import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const KML_URL = "https://www.google.com/maps/d/kml?mid=1vawftpdlPBLTwycgkrxXbRoobwBM50k&forcekml=1";

function extractTag(xml: string, tag: string) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return m ? m[1].trim() : "";
}
function extractData(xml: string, name: string) {
  const m = xml.match(new RegExp(`<Data name="${name}">[\\s\\S]*?<value>([\\s\\S]*?)<\\/value>`, "i"));
  return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "";
}
function parseConnectors(text: string) {
  const t = new Set<string>();
  if (/cc2|ccs2|ccs\s*2|combo/i.test(text)) t.add("CCS2");
  if (/chademo/i.test(text)) t.add("CHAdeMO");
  if (/tipo\s*2|type\s*2|t2|ac\s*22/i.test(text)) t.add("Tipo 2");
  return [...t];
}
function parsePower(text: string) {
  const m = text.match(/(\d+[\.,]?\d*)\s*kw/i);
  return m ? parseFloat(m[1].replace(",", ".")) : null;
}
function parseAddress(desc: string) {
  const parts = desc.split(/[\n|]/).map(l => l.replace(/^-\s*/, "").trim()).filter(Boolean);
  const addr = parts.find(l => /^\w/.test(l) && l.length > 10) ?? "";
  const segs = addr.split(",").map(s => s.trim());
  const city = (segs[1] ?? "").replace(/^[A-Z]\d{4}\s*/, "").replace(/\d+\s*/g, "").trim();
  return { address: segs[0] ?? "", city, province: segs[2] ?? "" };
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(KML_URL, {
      headers: { "User-Agent": "DóndeCargar/1.0 (lopezjuandiego@gmail.com)" },
    });
    if (!res.ok) throw new Error(`KML ${res.status}`);
    const kml = await res.text();

    const blocks = kml.split(/<Placemark[\s>]/i).slice(1);
    const stations = [];

    for (const block of blocks) {
      const coordsRaw = extractTag(block, "coordinates");
      if (!coordsRaw) continue;
      const [lngStr, latStr] = coordsRaw.trim().split(",");
      const lat = parseFloat(latStr), lng = parseFloat(lngStr);
      if (isNaN(lat) || isNaN(lng) || lat > -20 || lat < -55 || lng < -75 || lng > -50) continue;

      const rawName = extractTag(block, "name").replace(/\s*\|\s*(Powered|Poered) by Scame/i, "").trim() || "Scame";
      const desc = extractData(block, "Descripción");
      const { address, city, province } = parseAddress(desc);
      const connectors = parseConnectors(rawName + " " + desc);
      const isPrivate = /uso exclusivo|exclusivo\s+(empleados|propietarios|visitas|huespedes)/i.test(desc);

      stations.push({
        name: `Scame — ${rawName}`, operator: "Scame",
        address, city, province, lat, lng,
        connectorTypes: connectors.length ? connectors : ["Tipo 2"],
        powerKw: parsePower(desc),
        isFree: !isPrivate,
        accessType: isPrivate ? "restricted" : "public",
      });
    }

    const sql = getDb();
    const existing = await sql`SELECT lat, lng FROM "Station" WHERE source = 'scame'`;
    const existingSet = new Set(existing.map((s) =>
      `${parseFloat(String(s.lat)).toFixed(3)},${parseFloat(String(s.lng)).toFixed(3)}`
    ));

    let inserted = 0, skipped = 0;
    for (const s of stations) {
      const key = `${s.lat.toFixed(3)},${s.lng.toFixed(3)}`;
      if (existingSet.has(key)) { skipped++; continue; }
      await sql`
        INSERT INTO "Station"
          (name, operator, address, city, province, lat, lng,
           "connectorTypes", "powerKw", "accessType", "isFree", source, "isVerified")
        VALUES
          (${s.name}, ${s.operator}, ${s.address}, ${s.city}, ${s.province},
           ${s.lat}, ${s.lng}, ${JSON.stringify(s.connectorTypes)}, ${s.powerKw},
           ${s.accessType}, ${s.isFree}, 'scame', true)
      `;
      existingSet.add(key);
      inserted++;
    }

    return NextResponse.json({ ok: true, inserted, skipped, total: stations.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
