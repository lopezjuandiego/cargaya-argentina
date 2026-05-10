"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

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

const OPERATOR_COLORS: Record<string, string> = {
  Chargebox: "bg-blue-100 text-blue-700",
  YPF: "bg-yellow-100 text-yellow-700",
  "Shell Recharge": "bg-orange-100 text-orange-700",
  Scame: "bg-purple-100 text-purple-700",
  "Enel X": "bg-green-100 text-green-700",
  "AXION Energy": "bg-red-100 text-red-700",
  default: "bg-gray-100 text-gray-700",
};

function statusBadge(s: "working" | "not_working" | null) {
  if (s === "working")
    return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">✓ Funciona</span>;
  if (s === "not_working")
    return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">✗ Sin funcionar</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Sin reportes</span>;
}

function formatDistance(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function StationCard({ s, highlight = false }: { s: Station; highlight?: boolean }) {
  const connectors: string[] = JSON.parse(s.connectorTypes || "[]");
  const operatorClass = OPERATOR_COLORS[s.operator] ?? OPERATOR_COLORS.default;

  return (
    <a
      href={`/estacion/${s.id}`}
      className={`block bg-white rounded-2xl border p-4 hover:border-green-300 hover:shadow-md transition-all ${
        highlight ? "border-green-400 shadow-md ring-1 ring-green-200" : "border-gray-100 shadow-sm"
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${operatorClass}`}>
              {s.operator}
            </span>
            {statusBadge(s.lastStatus)}
            {s.isFree ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium">Gratis</span>
            ) : null}
          </div>
          <h2 className="font-semibold text-gray-900 text-base leading-tight truncate">{s.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5 truncate">{s.address}, {s.city}</p>
        </div>
        <div className="text-right flex-shrink-0 pl-2">
          {s.distanceKm !== undefined && (
            <div className="text-green-600 font-bold text-base">{formatDistance(s.distanceKm)}</div>
          )}
          {s.powerKw && (
            <div className="text-xs text-gray-400 mt-0.5">{s.powerKw} kW</div>
          )}
        </div>
      </div>
      {connectors.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mt-2.5">
          {connectors.map((c) => (
            <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {c}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}

const RADIOS = [5, 10, 15, 25, 50];

function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const [stations, setStations] = useState<Station[]>([]);
  const [closest, setClosest] = useState<Station | null>(null);
  const [resolvedLocation, setResolvedLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [radio, setRadio] = useState(15);

  function fetchStations(radiusKm: number) {
    const lat = params.get("lat");
    const lng = params.get("lng");
    const q = params.get("q");

    let url = `/api/estaciones?radio=${radiusKm}&`;
    if (lat && lng) {
      url += `lat=${lat}&lng=${lng}`;
    } else if (q) {
      url += `q=${encodeURIComponent(q)}`;
    } else {
      setError("No se especificó ubicación.");
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStations(data.stations ?? []);
        setClosest(data.closest ?? null);
        setResolvedLocation(data.resolvedLocation ?? "");
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }

  useEffect(() => {
    const lat = params.get("lat");
    const lng = params.get("lng");
    const q = params.get("q");
    if (lat && lng) setTitle("Estaciones cercanas a vos");
    else if (q) setTitle(`Resultados para "${q}"`);
    fetchStations(radio);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
        <div className="text-4xl animate-pulse">⚡</div>
        <p className="text-sm">Buscando estaciones...</p>
      </div>
    );
  }

  const hasResults = stations.length > 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => router.push("/")}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors text-lg"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-gray-900 truncate">{title}</h1>
          {resolvedLocation && (
            <p className="text-xs text-gray-400 truncate">📍 {resolvedLocation}</p>
          )}
          {!loading && (
            <p className="text-sm text-gray-500">
              {hasResults
                ? `${stations.length} estación${stations.length !== 1 ? "es" : ""} en ${radio} km`
                : `Sin resultados en ${radio} km`}
            </p>
          )}
        </div>
      </div>

      {/* Radio selector */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">Radio:</span>
        {RADIOS.map((r) => (
          <button
            key={r}
            onClick={() => { setRadio(r); fetchStations(r); }}
            className={`flex-shrink-0 text-sm px-3 py-1.5 rounded-full border transition-colors ${
              radio === r
                ? "bg-green-600 text-white border-green-600 font-semibold"
                : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
            }`}
          >
            {r} km
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>
      )}

      {/* Empty state with closest suggestion */}
      {!hasResults && !error && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-4 text-center">
            <div className="text-3xl mb-2">🔌</div>
            <p className="font-semibold text-gray-800">No hay estaciones en esa zona todavía</p>
            <p className="text-sm text-gray-500 mt-1">
              La red de carga en Argentina está creciendo — podés ser el primero en agregar una.
            </p>
            <a
              href="/agregar"
              className="inline-block mt-3 text-sm text-green-600 font-medium hover:underline"
            >
              + Agregar estación
            </a>
          </div>

          {closest && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-2">
                La más cercana que encontramos
              </p>
              <StationCard s={closest} highlight />
            </div>
          )}
        </div>
      )}

      {/* Results list */}
      {hasResults && (
        <div className="space-y-3">
          {stations.map((s) => (
            <StationCard key={s.id} s={s} />
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

export default function BuscarPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 min-h-screen">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <div className="text-4xl animate-pulse">⚡</div>
            <p className="text-sm">Cargando...</p>
          </div>
        }
      >
        <SearchResults />
      </Suspense>
    </div>
  );
}
