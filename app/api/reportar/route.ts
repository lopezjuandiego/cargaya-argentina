import { NextRequest, NextResponse } from "next/server";
import { addStatusReport, getStation } from "@/lib/stations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { stationId, isWorking, comment } = body;

    if (typeof stationId !== "number" || typeof isWorking !== "boolean") {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const station = await getStation(stationId);
    if (!station) {
      return NextResponse.json({ error: "Estación no encontrada" }, { status: 404 });
    }

    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? null;

    await addStatusReport(stationId, isWorking, comment ?? null, ip);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
