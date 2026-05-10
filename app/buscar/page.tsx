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
  if (s === "working") return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">✓ Funciona</span>;
  if (s === "not_working") return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">✗ Sin funcionar</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Sin reportes</span>;
}

function formatDistance(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    const lat = params.get("lat");
    const lng = params.get("lng");
    const q = params.get("q");

    let url = "/api/estaciones?";
    if (lat && lng) {
      url += `lat=${lat}&lng=${lng}`;
      setTitle("Estaciones cercanas a tu ubicación");
    } else if (q) {
      url += `q=${encodeURIComponent(q)}`;
      setTitle(`Resultados para "${q}"`);
    } else {
      setError("No se especificó ubicación ni búsqueda.");
      setLoading(false);
      return;
    }

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStations(data.stations);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [params]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <div className="text-4xl animate-spin mb-4">⚡</div>
        <p>Buscando estaciones...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => router.push("/")} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">←</button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">
            {stations.length === 0 ? "No se encontraron estaciones" : `${stations.length} estaciones encontradas`}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>
      )}

      {stations.length === 0 && !error && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">🔌</div>
          <p className="text-lg font-medium text-gray-600">No encontramos estaciones en esa zona</p>
          <p className="text-sm mt-2">Probá buscando en una zona más amplia o</p>
          <a href="/agregar" className="text-green-600 font-medium text-sm hover:underline">
            agregá una estación que conozcas
          </a>
        </div>
      )}

      <div className="space-y-3">
        {stations.map((s) => {
          const connectors: string[] = JSON.parse(s.connectorTypes || "[]");
          const operatorClass = OPERATOR_COLORS[s.operator] ?? OPERATOR_COLORS.default;

          return (
            <a
              key={s.id}
              href={`/estacion/${s.id}`}
              className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:border-green-300 hover:shadow-md transition-all"
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
        })}
      </div>

      {stations.length > 0 && (
        <div className="mt-6 text-center">
          <a href="/agregar" className="text-sm text-gray-400 hover:text-green-600 transition-colors">
            ¿Falta alguna estación? Agregala →
          </a>
        </div>
      )}
    </div>
  );
}

export default function BuscarPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 min-h-screen">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <div className="text-4xl animate-spin mb-4">⚡</div>
          <p>Cargando...</p>
        </div>
      }>
        <SearchResults />
      </Suspense>
    </div>
  );
}
