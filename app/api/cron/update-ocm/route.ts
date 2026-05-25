import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Open Charge Map API — free key at openchargemap.org
// Add OCM_API_KEY to Vercel env vars
const OCM_URL =
  "https://api.openchargemap.io/v3/poi/?output=json&countrycode=AR&maxresults=2000&compact=false&verbose=false";

type OcmConnection = {
  ConnectionType?: { Title?: string };
  PowerKW?: number | null;
};

type OcmStation = {
  ID: number;
  OperatorInfo?: { Title?: string };
  AddressInfo: {
    Title?: string;
    AddressLine1?: string;
    Town?: string;
    StateOrProvince?: string;
    Latitude: number;
    Longitude: number;
  };
  Connections?: OcmConnection[];
  StatusType?: { IsOperational?: boolean };
  UsageType?: { IsPayAtLocation?: boolean; IsMembershipRequired?: boolean };
};

const CONNECTOR_MAP: Record<string, string> = {
  "ccs (type 2)": "CCS2",
  "ccs type 2": "CCS2",
  "combined charging system (ccs) type 2": "CCS2",
  "ccs (type 1)": "CCS1",
  "type 2 (socket only)": "Tipo 2",
  "type 2 (tethered connector)": "Tipo 2",
  "mennekes (type 2)": "Tipo 2",
  "iec 62196-2 type 2": "Tipo 2",
  "chademo": "CHAdeMO",
  "tesla (roadster)": "Tesla",
  "tesla (model s/x)": "NACS",
  "tesla supercharger": "NACS",
  "nacs / sae j3400 (tesla)": "NACS",
  "type 1 (j1772)": "Tipo 1",
  "sae j1772 (type 1)": "Tipo 1",
};

function mapConnector(title: string | undefined): string | null {
  if (!title) return null;
  const key = title.toLowerCase().trim();
  return CONNECTOR_MAP[key] ?? null;
}

function mapProvince(raw: string | undefined): string {
  return (raw ?? "").replace(/^Province of\s+/i, "").trim();
}

// Prefixes of operators managed by dedicated crons — skip to avoid cross-source duplicates
const MANAGED_PREFIXES = ["ypf", "y.p.f.", "scame"];

function isManagedOperator(name: string | undefined): boolean {
  const n = (name ?? "").toLowerCase().trim();
  return MANAGED_PREFIXES.some((p) => n.startsWith(p) || n.includes(p));
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.OCM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OCM_API_KEY not set" }, { status: 500 });
  }

  try {
    const res = await fetch(`${OCM_URL}&key=${apiKey}`, {
      headers: { "User-Agent": "DóndeCargar/1.0 (lopezjuandiego@gmail.com)" },
    });
    if (!res.ok) throw new Error(`OCM API ${res.status}`);

    const stations = (await res.json()) as OcmStation[];

    const sql = getDb();
    // Check ALL sources to avoid cross-source duplicates (e.g. Scame in OCM)
    const existing = await sql`SELECT lat, lng FROM "Station"`;
    const existingSet = new Set(
      existing.map((s) => `${parseFloat(String(s.lat)).toFixed(3)},${parseFloat(String(s.lng)).toFixed(3)}`)
    );

    let inserted = 0, skipped = 0, managed = 0;

    for (const s of stations) {
      const lat = s.AddressInfo.Latitude;
      const lng = s.AddressInfo.Longitude;

      // Argentina bounding box check
      if (lat < -55 || lat > -22 || lng < -74 || lng > -52) { skipped++; continue; }

      const operatorName = s.OperatorInfo?.Title ?? "Desconocido";

      // Skip operators with dedicated crons
      if (isManagedOperator(operatorName)) { managed++; continue; }

      const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
      if (existingSet.has(key)) { skipped++; continue; }

      const connectors = [
        ...new Set(
          (s.Connections ?? [])
            .map((c) => mapConnector(c.ConnectionType?.Title))
            .filter((c): c is string => c !== null)
        ),
      ];
      if (connectors.length === 0) connectors.push("Tipo 2");

      const powerKw =
        Math.max(0, ...(s.Connections ?? []).map((c) => c.PowerKW ?? 0)) || null;

      const isFree = s.UsageType?.IsPayAtLocation === false;

      await sql`
        INSERT INTO "Station"
          (name, operator, address, city, province, lat, lng,
           "connectorTypes", "powerKw", "accessType", "isFree", source, "isVerified")
        VALUES
          (${s.AddressInfo.Title ?? operatorName},
           ${operatorName},
           ${s.AddressInfo.AddressLine1 ?? ""},
           ${s.AddressInfo.Town ?? ""},
           ${mapProvince(s.AddressInfo.StateOrProvince)},
           ${lat}, ${lng},
           ${JSON.stringify(connectors)},
           ${powerKw},
           'public',
           ${isFree},
           'ocm',
           false)
      `;
      existingSet.add(key);
      inserted++;
    }

    return NextResponse.json({
      ok: true,
      inserted,
      skipped,
      managed_skipped: managed,
      total_from_ocm: stations.length,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
