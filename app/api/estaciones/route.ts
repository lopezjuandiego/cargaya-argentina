import { NextRequest, NextResponse } from "next/server";
import { getNearbyStations, getClosestStation, getLastStatus } from "@/lib/stations";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const radio = searchParams.get("radio") ? parseFloat(searchParams.get("radio")!) : 5;

  try {
    if (latParam && lngParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      const stations = await getNearbyStations(lat, lng, radio, 30);
      const withStatus = await Promise.all(
        stations.map(async (s) => ({ ...s, lastStatus: await getLastStatus(s.id) }))
      );
      let closest = null;
      if (!stations.length) {
        const c = await getClosestStation(lat, lng);
        if (c) closest = { ...c, lastStatus: await getLastStatus(c.id) };
      }
      return NextResponse.json({ stations: withStatus, closest });
    }
    return NextResponse.json({ error: "Se requiere lat+lng" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
