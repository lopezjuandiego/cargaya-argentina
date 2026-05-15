import { NextRequest, NextResponse } from "next/server";
import { addStatusReport, getStation } from "@/lib/stations";
import { getDb } from "@/lib/db";

// 15 reports per IP per hour
const RATE_LIMIT = { max: 15, windowMinutes: 60 };

async function isRateLimited(ip: string): Promise<boolean> {
  try {
    const rows = await getDb()`
      SELECT COUNT(*)::int AS n FROM "StatusReport"
      WHERE "reporterIp" = ${ip}
        AND "reportedAt" > NOW() - INTERVAL '1 hour'
    `;
    return (rows[0] as { n: number }).n >= RATE_LIMIT.max;
  } catch {
    return false; // fail open — don't block if DB check fails
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { stationId, isWorking, comment } = body;

    if (typeof stationId !== "number" || typeof isWorking !== "boolean") {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    if (comment !== undefined && (typeof comment !== "string" || comment.length > 500)) {
      return NextResponse.json({ error: "Comentario demasiado largo (máx. 500 caracteres)" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
      ?? req.headers.get("x-real-ip")
      ?? "unknown";

    if (ip !== "unknown" && await isRateLimited(ip)) {
      return NextResponse.json(
        { error: `Demasiados reportes. Podés enviar hasta ${RATE_LIMIT.max} por hora.` },
        { status: 429 }
      );
    }

    const station = await getStation(stationId);
    if (!station) {
      return NextResponse.json({ error: "Estación no encontrada" }, { status: 404 });
    }

    await addStatusReport(stationId, isWorking, comment ?? null, ip);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
