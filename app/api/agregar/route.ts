import { NextRequest, NextResponse } from "next/server";
import { addUserSubmission } from "@/lib/stations";
import { getDb } from "@/lib/db";

const MAX = { name: 120, operator: 80, address: 200, city: 80, province: 60, comment: 1000 };

// 5 submissions per IP per day
const RATE_LIMIT = { max: 5, windowHours: 24 };

function isValidCoord(lat: unknown, lng: unknown): boolean {
  const la = Number(lat), lo = Number(lng);
  return Number.isFinite(la) && Number.isFinite(lo) && la >= -90 && la <= 90 && lo >= -180 && lo <= 180;
}

async function isRateLimited(ip: string): Promise<boolean> {
  try {
    const rows = await getDb()`
      SELECT COUNT(*)::int AS n FROM "UserSubmission"
      WHERE "submitterIp" = ${ip}
        AND "submittedAt" > NOW() - INTERVAL '24 hours'
    `;
    return (rows[0] as { n: number }).n >= RATE_LIMIT.max;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, operator, address, city, province, lat, lng, connectorTypes, powerKw, comment } = body;

    if (!name?.trim() || !address?.trim() || !city?.trim() || !province?.trim()) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }
    if (typeof name !== "string" || name.length > MAX.name)
      return NextResponse.json({ error: "Nombre demasiado largo" }, { status: 400 });
    if (address.length > MAX.address)
      return NextResponse.json({ error: "Dirección demasiado larga" }, { status: 400 });
    if (city.length > MAX.city)
      return NextResponse.json({ error: "Ciudad demasiado larga" }, { status: 400 });
    if (comment && typeof comment === "string" && comment.length > MAX.comment)
      return NextResponse.json({ error: "Comentario demasiado largo (máx. 1000 caracteres)" }, { status: 400 });
    if (!Array.isArray(connectorTypes ?? []))
      return NextResponse.json({ error: "Conectores inválidos" }, { status: 400 });

    const hasCoordsInput = lat != null && lng != null;
    if (hasCoordsInput && !isValidCoord(lat, lng))
      return NextResponse.json({ error: "Coordenadas inválidas" }, { status: 400 });

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
      ?? req.headers.get("x-real-ip")
      ?? "unknown";

    if (ip !== "unknown" && await isRateLimited(ip)) {
      return NextResponse.json(
        { error: `Demasiados envíos. Podés enviar hasta ${RATE_LIMIT.max} estaciones por día.` },
        { status: 429 }
      );
    }

    await addUserSubmission({
      name: name.trim().slice(0, MAX.name),
      operator: (operator ?? "").toString().trim().slice(0, MAX.operator),
      address: address.trim().slice(0, MAX.address),
      city: city.trim().slice(0, MAX.city),
      province: province.trim().slice(0, MAX.province),
      lat: hasCoordsInput ? parseFloat(lat) : null,
      lng: hasCoordsInput ? parseFloat(lng) : null,
      connectorTypes: JSON.stringify((connectorTypes ?? []).slice(0, 10)),
      powerKw: powerKw ? parseFloat(powerKw) : null,
      comment: comment ? comment.toString().trim().slice(0, MAX.comment) : null,
      submitterIp: ip,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
