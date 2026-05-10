import { getNearbyStations, getClosestStation, getLastStatus } from "@/lib/stations";
import StationCard from "./StationCard";
import RadioSelector from "./RadioSelector";
import BackButton from "./BackButton";

type Station = {
  id: number;
  name: string;
  operator: string;
  category: string | null;
  address: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
  connectorTypes: string;
  powerKw: number | null;
  isFree: number;
  isVerified: number;
  distanceKm?: number;
  lastStatus: "working" | "not_working" | null;
};

async function geocode(q: string): Promise<{ lat: number; lng: number; display: string } | null> {
  const query = encodeURIComponent(`${q}, Argentina`);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=ar`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "CargaYa/1.0 (contacto@cargaya.com.ar)" },
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

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ lat?: string; lng?: string; q?: string; radio?: string }>;
}) {
  const params = await searchParams;
  const radio = params.radio ? parseInt(params.radio) : 15;

  let stations: Station[] = [];
  let closest: Station | null = null;
  let title = "";
  let resolvedLocation = "";
  let errorMsg = "";

  if (params.lat && params.lng) {
    const lat = parseFloat(params.lat);
    const lng = parseFloat(params.lng);
    title = "Estaciones cercanas a vos";
    const raw = getNearbyStations(lat, lng, radio, 30);
    stations = raw.map((s) => ({ ...s, lastStatus: getLastStatus(s.id) }));
    if (stations.length === 0) {
      const c = getClosestStation(lat, lng);
      if (c) closest = { ...c, lastStatus: getLastStatus(c.id) };
    }
  } else if (params.q) {
    title = `Resultados para "${params.q}"`;
    const geo = await geocode(params.q);
    if (!geo) {
      errorMsg = `No encontramos "${params.q}" en el mapa. Intentá con una ciudad o barrio conocido.`;
      const c = getClosestStation();
      if (c) closest = { ...c, lastStatus: getLastStatus(c.id) };
    } else {
      resolvedLocation = geo.display;
      const raw = getNearbyStations(geo.lat, geo.lng, radio, 30);
      stations = raw.map((s) => ({ ...s, lastStatus: getLastStatus(s.id) }));
      if (stations.length === 0) {
        const c = getClosestStation(geo.lat, geo.lng);
        if (c) closest = { ...c, lastStatus: getLastStatus(c.id) };
      }
    }
  } else {
    errorMsg = "Ingresá una ciudad, barrio o usá tu ubicación.";
  }

  const hasResults = stations.length > 0;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <BackButton />
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-gray-900 truncate">{title || "Búsqueda"}</h1>
          {resolvedLocation && (
            <p className="text-xs text-gray-400 truncate">📍 {resolvedLocation}</p>
          )}
          <p className="text-sm text-gray-500">
            {hasResults
              ? `${stations.length} estación${stations.length !== 1 ? "es" : ""} en ${radio} km`
              : errorMsg ? "" : `Sin resultados en ${radio} km`}
          </p>
        </div>
      </div>

      {/* Radio selector */}
      <RadioSelector
        current={radio}
        lat={params.lat}
        lng={params.lng}
        q={params.q}
      />

      {/* Error */}
      {errorMsg && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-800 mb-4">
          {errorMsg}
        </div>
      )}

      {/* Empty state */}
      {!hasResults && !errorMsg && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-4 text-center mb-4">
          <div className="text-3xl mb-2">🔌</div>
          <p className="font-semibold text-gray-800">No hay estaciones en esa zona todavía</p>
          <p className="text-sm text-gray-500 mt-1">
            Ampliá el radio de búsqueda o agregá una que conozcas.
          </p>
          <a href="/agregar" className="inline-block mt-3 text-sm text-green-600 font-medium hover:underline">
            + Agregar estación
          </a>
        </div>
      )}

      {/* Closest fallback */}
      {closest && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-2">
            La más cercana que encontramos
          </p>
          <StationCard station={closest} highlight />
        </div>
      )}

      {/* Results */}
      {hasResults && (
        <div className="space-y-3">
          {stations.map((s) => (
            <StationCard key={s.id} station={s} />
          ))}
          <div className="pt-2 text-center">
            <a href="/agregar" className="text-sm text-gray-400 hover:text-green-600 transition-colors">
              ¿Falta alguna? Agregala →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
