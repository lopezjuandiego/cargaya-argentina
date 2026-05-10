import { NextRequest, NextResponse } from "next/server";
import { addUserSubmission } from "@/lib/stations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, operator, address, city, province, lat, lng, connectorTypes, powerKw, comment } = body;

    if (!name || !address || !city || !province) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    await addUserSubmission({
      name,
      operator: operator ?? "",
      address,
      city,
      province,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      connectorTypes: JSON.stringify(connectorTypes ?? []),
      powerKw: powerKw ? parseFloat(powerKw) : null,
      comment: comment ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
