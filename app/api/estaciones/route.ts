import { NextRequest, NextResponse } from "next/server";
import { getNearbyStations, searchStationsByCity, getLastStatus } from "@/lib/stations";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const q = searchParams.get("q");

  try {
    if (lat && lng) {
      const stations = getNearbyStations(parseFloat(lat), parseFloat(lng), 100, 30);
      const withStatus = stations.map((s) => ({
        ...s,
        lastStatus: getLastStatus(s.id),
      }));
      return NextResponse.json({ stations: withStatus });
    }

    if (q) {
      const stations = searchStationsByCity(q, 30);
      const withStatus = stations.map((s) => ({
        ...s,
        lastStatus: getLastStatus(s.id),
      }));
      return NextResponse.json({ stations: withStatus });
    }

    return NextResponse.json({ error: "Se requiere lat+lng o q" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
