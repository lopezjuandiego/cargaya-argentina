"use client";

import { useState } from "react";

const CONNECTOR_INFO: Record<string, string> = {
  "Tipo 2": "AC (hasta 43 kW) · Compatible: VW ID.4, Fiat 500e, Renault Kangoo ZE, Peugeot e-208, BMW i3...",
  CCS2: "Carga rápida DC (hasta 350 kW) · Compatible: VW ID.4, BMW iX, Audi e-tron, Peugeot e-208, Fiat 500e...",
  CHAdeMO: "Carga rápida DC · Compatible: Nissan Leaf, Mitsubishi Outlander PHEV...",
  NACS: "Tesla / SAE J3400 · Compatible con todos los Tesla y nuevos modelos con adaptador",
  CCS1: "Carga rápida DC (estándar americano) · Compatible con algunos modelos americanos y asiáticos",
  "Tipo 1": "AC (hasta 7.4 kW) · Compatible: Nissan Leaf (gen 1), algunos modelos asiáticos y americanos",
  "Tesla SC": "Supercharger Tesla · Exclusivo para vehículos Tesla",
  Tesla: "Conector Tesla (Roadster)",
  "Tipo 3": "AC europeo antiguo · Poco común en Argentina",
};

const OPERATOR_COLORS: Record<string, string> = {
  Chargebox: "bg-blue-100 text-blue-700",
  YPF: "bg-yellow-100 text-yellow-700",
  "Shell Recharge": "bg-orange-100 text-orange-700",
  Scame: "bg-purple-100 text-purple-700",
  "Enel X": "bg-green-100 text-green-700",
  "AXION Energy": "bg-red-100 text-red-700",
  default: "bg-gray-100 text-gray-700",
};

function ConnectorBadge({ type }: { type: string }) {
  const info = CONNECTOR_INFO[type];
  return (
    <span className="relative group/tip inline-block">
      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full cursor-help select-none">
        {type}
      </span>
      {info && (
        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tip:block z-20 w-56 bg-gray-900 text-white text-xs rounded-xl px-3 py-2 leading-snug text-center shadow-lg">
          {info}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </span>
      )}
    </span>
  );
}

type RouteStation = {
  id: number;
  name: string;
  operator: string;
  address: string;
  city: string;
  connectorTypes: string;
  powerKw: number | null;
  isFree: boolean;
  distanceKm: number;
  lastStatus: "working" | "not_working" | null;
};

function statusBadge(s: "working" | "not_working" | null) {
  if (s === "working")
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
        ✓ Funciona
      </span>
    );
  if (s === "not_working")
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
        ✗ Sin funcionar
      </span>
    );
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
      Sin reportes
    </span>
  );
}

function StationCard({ station: s }: { station: RouteStation }) {
  const connectors: string[] = JSON.parse(s.connectorTypes || "[]");
  const operatorClass = OPERATOR_COLORS[s.operator] ?? OPERATOR_COLORS.default;
  const dist = s.distanceKm < 1 ? `${Math.round(s.distanceKm * 1000)} m` : `${s.distanceKm.toFixed(1)} km`;

  return (
    <a
      href={`/estacion/${s.id}`}
      className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-green-300 hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${operatorClass}`}>
              {s.operator}
            </span>
            {statusBadge(s.lastStatus)}
            {s.isFree && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium">
                Gratis
              </span>
            )}
          </div>
          <h2 className="font-semibold text-gray-900 text-base leading-tight truncate">
            {s.name}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5 truncate">
            {s.address}, {s.city}
          </p>
        </div>
        <div className="text-right flex-shrink-0 pl-2">
          <div className="text-green-600 font-bold text-base">{dist}</div>
          {s.powerKw && (
            <div className="text-xs text-gray-400 mt-0.5">{s.powerKw} kW</div>
          )}
        </div>
      </div>
      {connectors.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mt-2.5">
          {connectors.map((c) => (
            <ConnectorBadge key={c} type={c} />
          ))}
        </div>
      )}
    </a>
  );
}

type GeoResult = { lat: number; lng: number; display: string };

async function geocode(q: string): Promise<GeoResult | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ", Argentina")}&format=json&limit=1&countrycodes=ar`,
      { headers: { "User-Agent": "CargaYa/1.0 (contacto@cargaya.com.ar)" } }
    );
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

function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

type RouteResult = {
  stations: RouteStation[];
  route: { distanceKm: number; durationMin: number };
  fromDisplay: string;
  toDisplay: string;
};

export default function RutaClient() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [radio, setRadio] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RouteResult | null>(null);
  const [coords, setCoords] = useState<{ from: GeoResult; to: GeoResult } | null>(null);

  async function fetchRoute(fromGeo: GeoResult, toGeo: GeoResult, r: number) {
    const res = await fetch(
      `/api/ruta?from_lat=${fromGeo.lat}&from_lng=${fromGeo.lng}&to_lat=${toGeo.lat}&to_lng=${toGeo.lng}&radio=${r}`
    );
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Error al calcular la ruta.");
    }
    return res.json();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!from.trim() || !to.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    const [fromGeo, toGeo] = await Promise.all([
      geocode(from.trim()),
      geocode(to.trim()),
    ]);

    if (!fromGeo) {
      setError(`No encontramos "${from}" en Argentina.`);
      setLoading(false);
      return;
    }
    if (!toGeo) {
      setError(`No encontramos "${to}" en Argentina.`);
      setLoading(false);
      return;
    }

    setCoords({ from: fromGeo, to: toGeo });

    try {
      const data = await fetchRoute(fromGeo, toGeo, radio);
      setResult({
        stations: data.stations,
        route: data.route,
        fromDisplay: fromGeo.display,
        toDisplay: toGeo.display,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión.");
    }
    setLoading(false);
  }

  async function handleRadioChange(newRadio: number) {
    setRadio(newRadio);
    if (!result || !coords) return;
    setLoading(true);
    try {
      const data = await fetchRoute(coords.from, coords.to, newRadio);
      setResult((prev) => prev ? { ...prev, stations: data.stations } : prev);
    } catch { /* ignore */ }
    setLoading(false);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <a
          href="/"
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-gray-200 shadow-sm text-gray-600 hover:bg-gray-50 transition-colors text-lg"
        >
          ←
        </a>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Ruta con cargadores</h1>
          <p className="text-xs text-gray-400">Estaciones en el corredor entre dos puntos</p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3 mb-4"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs flex items-center justify-center font-bold flex-shrink-0">
              A
            </span>
            <input
              type="text"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="Origen (ciudad, barrio...)"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs flex items-center justify-center font-bold flex-shrink-0">
              B
            </span>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Destino (ciudad, barrio...)"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">Corredor:</span>
            {[5, 10, 20].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRadioChange(r)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  radio === r
                    ? "bg-green-600 text-white border-green-600"
                    : "border-gray-200 text-gray-600 hover:border-green-400"
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
          >
            {loading ? "Calculando..." : "Ver ruta"}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-800 mb-4">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && !result && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3 animate-pulse">🗺️</div>
          <p className="text-sm">Calculando ruta y buscando cargadores...</p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <>
          <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 mb-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-green-700 font-medium truncate">
                  {result.fromDisplay} → {result.toDisplay}
                </p>
                <p className="text-sm text-green-900 font-bold mt-0.5">
                  {result.route.distanceKm} km · {formatDuration(result.route.durationMin)}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-bold text-green-700">
                  {result.stations.length}
                </div>
                <div className="text-xs text-green-600">cargador{result.stations.length !== 1 ? "es" : ""}</div>
              </div>
            </div>
          </div>

          {result.stations.length > 0 ? (
            <>
              <p className="text-xs text-gray-400 px-1 mb-2">
                Distancia = desvío desde la ruta · Orden: de inicio a fin
              </p>
              <div className="space-y-3">
                {result.stations.map((s) => (
                  <StationCard key={s.id} station={s} />
                ))}
                <p className="text-xs text-center text-gray-400 pt-2">
                  ¿Falta alguna?{" "}
                  <a href="/agregar" className="text-green-600 hover:underline">
                    Agregala →
                  </a>
                </p>
              </div>
            </>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-6 text-center">
              <div className="text-3xl mb-2">🔌</div>
              <p className="font-semibold text-gray-800">Sin cargadores en el corredor</p>
              <p className="text-sm text-gray-500 mt-1">
                Probá ampliando el corredor a 20 km o{" "}
                <a href="/agregar" className="text-green-600 hover:underline">
                  agregá una estación
                </a>
                .
              </p>
            </div>
          )}
        </>
      )}

      {/* Idle state */}
      {!result && !error && !loading && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">🗺️</div>
          <p className="text-sm">
            Ingresá origen y destino para ver
            <br />
            los cargadores en tu camino.
          </p>
        </div>
      )}
    </div>
  );
}
