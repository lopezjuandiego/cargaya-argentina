import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getExpectedToken } from "@/lib/admin-auth";

async function isAuthorized(req: NextRequest): Promise<boolean> {
  const cookie = req.cookies.get("admin_auth")?.value;
  const expected = await getExpectedToken();
  return !!cookie && cookie === expected;
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await req.json();
  if (typeof id !== "number") {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const sql = getDb();
  const rows = await sql`SELECT * FROM "UserSubmission" WHERE id = ${id} AND status = 'pending'`;
  const sub = rows[0] as {
    id: number; name: string; operator: string | null; address: string;
    city: string; province: string; lat: number | null; lng: number | null;
    connectorTypes: string; powerKw: number | null; comment: string | null;
  } | undefined;

  if (!sub) return NextResponse.json({ error: "Submission no encontrada o ya procesada" }, { status: 404 });
  if (sub.lat === null || sub.lng === null) {
    return NextResponse.json({ error: "La submission no tiene coordenadas. Geocodificá la dirección antes de aprobar." }, { status: 422 });
  }

  const inserted = await sql`
    INSERT INTO "Station"
      (name, operator, category, address, city, province, lat, lng,
       "connectorTypes", "powerKw", "isFree", "accessType", source, "isVerified", "createdAt", "updatedAt")
    VALUES
      (${sub.name}, ${sub.operator ?? "Desconocido"}, null,
       ${sub.address}, ${sub.city}, ${sub.province}, ${sub.lat}, ${sub.lng},
       ${sub.connectorTypes ?? "[]"}, ${sub.powerKw}, false, 'public', 'user_submission', true, NOW(), NOW())
    RETURNING id
  `;
  const stationId = (inserted[0] as { id: number }).id;

  await sql`
    UPDATE "UserSubmission" SET status = 'approved', "stationId" = ${stationId} WHERE id = ${id}
  `;

  return NextResponse.json({ ok: true, stationId });
}
