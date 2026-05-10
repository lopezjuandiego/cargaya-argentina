import { NextRequest, NextResponse } from "next/server";
import { getNearbyStations, getClosestStation, getLastStatus } from "@/lib/stations";

async function geocode(q: string): Promise<{ lat: number; lng: number; display: string } | null> {
  // Nominatim free geocoding — append Argentina to bias results
  const query = encodeURIComponent(`${q}, Argentina`);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=ar`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "CargaYa/1.0 (cargaya.com.ar)" },
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    if (!data.length) return null;
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      display: data[0].display_name.split(",").slice(0, 2).join(", "),
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const q = searchParams.get("q");

  try {
    let lat: number;
    let lng: number;
    let resolvedLocation = "";

    if (latParam && lngParam) {
      lat = parseFloat(latParam);
      lng = parseFloat(lngParam);
    } else if (q) {
      const geo = await geocode(q);
      if (!geo) {
        // geocoding failed — try text fallback then return closest
        const closest = getClosestStation();
        return NextResponse.json({
          stations: [],
          closest: closest ? { ...closest, lastStatus: getLastStatus(closest.id) } : null,
          geocodeFailed: true,
        });
      }
      lat = geo.lat;
      lng = geo.lng;
      resolvedLocation = geo.display;
    } else {
      return NextResponse.json({ error: "Se requiere lat+lng o q" }, { status: 400 });
    }

    const radius = searchParams.get("radio") ? parseFloat(searchParams.get("radio")!) : 15;
    let stations = getNearbyStations(lat, lng, radius, 30);

    const withStatus = stations.map((s) => ({
      ...s,
      lastStatus: getLastStatus(s.id),
    }));

    // If no stations in radius, find the single closest one
    let closest = null;
    if (stations.length === 0) {
      const c = getClosestStation(lat, lng);
      if (c) closest = { ...c, lastStatus: getLastStatus(c.id) };
    }

    return NextResponse.json({
      stations: withStatus,
      closest,
      resolvedLocation,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
