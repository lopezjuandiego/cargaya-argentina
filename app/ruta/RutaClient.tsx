"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import RouteMap from "./RouteMap";
import { searchCities, lookupCity, type CityResult } from "@/lib/cities";

// ─── Sub-components ───────────────────────────────────────────────────────────

const CONNECTOR_INFO: Record<string, string> = {
  "Tipo 2": "AC (hasta 43 kW) · Compatible: VW ID.4, Fiat 500e, Renault Kangoo ZE, Peugeot e-208, BMW i3...",
  CCS2: "Carga rápida DC (hasta 350 kW) · Compatible: VW ID.4, BMW iX, Audi e-tron, Peugeot e-208, Fiat 500e...",
  CHAdeMO: "Carga rápida DC · Compatible: Nissan Leaf, Mitsubishi Outlander PHEV...",
  NACS: "Tesla / SAE J3400 · Compatible con todos los Tesla y nuevos modelos con adaptador",
  CCS1: "Carga rápida DC (estándar americano)",
  "Tipo 1": "AC (hasta 7.4 kW) · Compatible: Nissan Leaf gen 1, algunos modelos asiáticos y americanos",
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
      {info ? (
        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tip:block z-20 w-56 bg-gray-900 text-white text-xs rounded-xl px-3 py-2 leading-snug text-center shadow-lg">
          {info}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </span>
      ) : null}
    </span>
  );
}

type RouteStation = {
  id: number;
  name: string;
  operator: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  connectorTypes: string;
  powerKw: number | null;
  isFree: boolean;
  distanceKm: number;
  position: number;
  lastStatus: "working" | "not_working" | null;
};

function statusBadge(s: "working" | "not_working" | null) {
  if (s === "working")
    return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">✓ Funciona</span>;
  if (s === "not_working")
    return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">✗ Sin funcionar</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Sin reportes</span>;
}

function StationCard({ station: s }: { station: RouteStation }) {
  const connectors: string[] = JSON.parse(s.connectorTypes || "[]");
  const operatorClass = OPERATOR_COLORS[s.operator] ?? OPERATOR_COLORS.default;
  const desvio =
    s.distanceKm < 0.3
      ? null
      : s.distanceKm < 1
      ? `${Math.round(s.distanceKm * 1000)} m desvío`
      : `${s.distanceKm.toFixed(1)} km desvío`;

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
            {s.isFree ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium">
                Gratis
              </span>
            ) : null}
          </div>
          <h2 className="font-semibold text-gray-900 text-base leading-tight truncate">{s.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5 truncate">{s.address}, {s.city}</p>
        </div>
        <div className="text-right flex-shrink-0 pl-2">
          <div className="text-green-700 font-bold text-base">km {Math.round(s.position)}</div>
          {desvio ? <div className="text-xs text-gray-400 mt-0.5">{desvio}</div> : null}
          {s.powerKw ? <div className="text-xs text-gray-400 mt-0.5">{s.powerKw} kW</div> : null}
        </div>
      </div>
      {connectors.length > 0 ? (
        <div className="flex gap-1.5 flex-wrap mt-2.5">
          {connectors.map((c) => <ConnectorBadge key={c} type={c} />)}
        </div>
      ) : null}
    </a>
  );
}

function GapIndicator({ gapKm, autonomy, label }: { gapKm: number; autonomy: number; label?: string }) {
  if (gapKm < 15) return null;
  const critical = gapKm > autonomy;
  const warning = gapKm > autonomy * 0.75;
  const text = label ?? `${Math.round(gapKm)} km sin cargadores`;

  if (critical || warning) {
    const pillClass = critical
      ? "bg-red-100 text-red-700 border-red-200"
      : "bg-amber-100 text-amber-700 border-amber-200";
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="flex-1 h-px bg-gray-200" />
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border whitespace-nowrap ${pillClass}`}>
          {critical ? "⚠️ " : ""}{text}
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
    );
  }

  // Safe gap — visible but not alarming
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs font-medium text-gray-400 whitespace-nowrap">{text}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

function Semaphore({ stations, routeDistanceKm, autonomy }: {
  stations: RouteStation[];
  routeDistanceKm: number;
  autonomy: number;
}) {
  const gaps =
    stations.length === 0
      ? [routeDistanceKm]
      : [
          stations[0].position,
          ...stations.slice(1).map((s, i) => s.position - stations[i].position),
          routeDistanceKm - stations[stations.length - 1].position,
        ];

  const maxGap = Math.round(Math.max(...gaps));
  const critical = maxGap > autonomy;
  const warning = maxGap > autonomy * 0.75;
  const icon = critical ? "🔴" : warning ? "🟡" : "🟢";
  const label = critical ? "Gap crítico" : warning ? "Posible con planificación" : "Viaje viable";
  const colorClass = critical ? "text-red-700" : warning ? "text-amber-700" : "text-green-700";
  const bgClass = critical ? "bg-red-50 border-red-100" : warning ? "bg-amber-50 border-amber-100" : "bg-green-50 border-green-100";
  const desc = critical
    ? `Tramo de ${maxGap} km supera tu autonomía de ${autonomy} km`
    : warning
    ? `Tramo de ${maxGap} km, cerca de tus ${autonomy} km de autonomía`
    : `Tramo máximo ${maxGap} km · dentro de tus ${autonomy} km`;

  return (
    <div className={`rounded-2xl border px-4 py-3 mb-3 ${bgClass}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-sm font-bold ${colorClass}`}>{icon} {label}</p>
          <p className="text-xs text-gray-600 mt-0.5 leading-snug">{desc}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`text-xl font-bold ${colorClass}`}>{maxGap} km</div>
          <div className="text-xs text-gray-400">gap máx.</div>
        </div>
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Segment = { gapBefore: number; stations: RouteStation[] };

type GeoResult = { lat: number; lng: number; display: string };

type RouteResult = {
  stations: RouteStation[];
  route: { distanceKm: number; durationMin: number };
  geometry: [number, number][];
  fromDisplay: string;
  toDisplay: string;
};

type GeoCoords = { from: GeoResult; to: GeoResult };

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ─── CityInput — autocomplete dropdown ───────────────────────────────────────

function CityInput({
  value,
  onChange,
  onSelect,
  placeholder,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (city: CityResult) => void;
  placeholder: string;
  required?: boolean;
}) {
  const [suggestions, setSuggestions] = useState<CityResult[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function handleChange(text: string) {
    onChange(text);
    const results = searchCities(text);
    setSuggestions(results);
    setOpen(results.length > 0);
  }

  function handleSelect(city: CityResult) {
    onChange(city.display);
    onSelect(city);
    setSuggestions([]);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative flex-1">
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      {open && suggestions.length > 0 ? (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
              className="w-full text-left px-3 py-2.5 text-sm hover:bg-green-50 flex items-center gap-2 border-b border-gray-50 last:border-0 transition-colors"
            >
              <span className="text-gray-300 text-xs flex-shrink-0">📍</span>
              <span className="text-gray-800 truncate">{s.display}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ─── Geocoding ────────────────────────────────────────────────────────────────

async function geocode(q: string): Promise<GeoResult | null> {
  // 1. Local lookup first — instant, no network
  const local = lookupCity(q);
  if (local) return local;

  // 2. Nominatim fallback
  const trySearch = async (query: string, countryCode: boolean) => {
    const url =
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1` +
      (countryCode ? "&countrycodes=ar" : "");
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!data.length) return null;
      const r = data[0];
      if (!countryCode) {
        const lat = parseFloat(r.lat), lng = parseFloat(r.lon);
        if (lat < -55 || lat > -22 || lng < -74 || lng > -53) return null;
      }
      return {
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
        display: r.display_name.split(",").slice(0, 2).join(", "),
      };
    } catch { return null; }
  };

  return (
    (await trySearch(`${q}, Argentina`, true)) ??
    (await trySearch(q, true)) ??
    (await trySearch(q, false))
  );
}

function formatDuration(min: number) {
  const h = Math.floor(min / 60), m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

// Group consecutive stations — a new segment starts whenever there's a gap ≥15 km before a station
function buildSegments(stations: RouteStation[], gaps: number[]): Segment[] {
  if (stations.length === 0) return [];
  const segs: Segment[] = [];
  let cur: RouteStation[] = [];
  let gapBefore = gaps[0];

  for (let i = 0; i < stations.length; i++) {
    if (i > 0 && gaps[i] >= 15) {
      segs.push({ gapBefore, stations: cur });
      cur = [];
      gapBefore = gaps[i];
    }
    cur.push(stations[i]);
  }
  segs.push({ gapBefore, stations: cur });
  return segs;
}

function ShareButton({ from, to, radio, autonomy }: { from: string; to: string; radio: number; autonomy: number }) {
  const [copied, setCopied] = useState(false);

  function share() {
    const p = new URLSearchParams({ from, to, radio: String(radio), autonomy: String(autonomy) });
    const url = `${window.location.origin}/ruta?${p.toString()}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button onClick={share} className="text-xs text-gray-400 hover:text-green-600 transition-colors">
      {copied ? "✓ Copiado" : "Compartir"}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RutaClient() {
  const sp = useSearchParams();
  const [from, setFrom] = useState(sp.get("from") ?? "");
  const [to, setTo] = useState(sp.get("to") ?? "");
  const [fromResolved, setFromResolved] = useState<CityResult | null>(null);
  const [toResolved, setToResolved] = useState<CityResult | null>(null);
  const [radio, setRadio] = useState(sp.get("radio") ? parseInt(sp.get("radio")!) : 10);
  const [autonomy, setAutonomy] = useState(sp.get("autonomy") ? parseInt(sp.get("autonomy")!) : 300);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RouteResult | null>(null);
  const [coords, setCoords] = useState<GeoCoords | null>(null);
  const [formCollapsed, setFormCollapsed] = useState(false);
  const [expandedSegments, setExpandedSegments] = useState<Set<number>>(new Set());

  function toggleSegment(idx: number) {
    setExpandedSegments((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }

  async function fetchRoute(geo: GeoCoords, r: number) {
    const res = await fetch(
      `/api/ruta?from_lat=${geo.from.lat}&from_lng=${geo.from.lng}&to_lat=${geo.to.lat}&to_lng=${geo.to.lng}&radio=${r}`
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
    setFormCollapsed(false);
    setExpandedSegments(new Set());

    // Use pre-resolved coords from autocomplete, fallback to geocoding
    const [fromGeo, toGeo] = await Promise.all([
      fromResolved ?? geocode(from.trim()),
      toResolved ?? geocode(to.trim()),
    ]);

    if (!fromGeo) {
      setError(`No encontramos "${from}" en Argentina. Verificá la ortografía.`);
      setLoading(false);
      return;
    }
    if (!toGeo) {
      setError(`No encontramos "${to}" en Argentina. Verificá la ortografía.`);
      setLoading(false);
      return;
    }

    const geo = { from: fromGeo, to: toGeo };
    setCoords(geo);

    try {
      const data = await fetchRoute(geo, radio);
      setResult({ stations: data.stations, route: data.route, geometry: data.geometry ?? [], fromDisplay: fromGeo.display, toDisplay: toGeo.display });
      setFormCollapsed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión.");
    }
    setLoading(false);
  }

  async function handleRadioChange(newRadio: number) {
    setRadio(newRadio);
    if (!result || !coords) return;
    setLoading(true);
    setExpandedSegments(new Set());
    try {
      const data = await fetchRoute(coords, newRadio);
      setResult((prev) => (prev ? { ...prev, stations: data.stations } : prev));
    } catch { /* ignore */ }
    setLoading(false);
  }

  // Derived state — computed once per render
  const gaps: number[] =
    result && result.stations.length > 0
      ? [
          result.stations[0].position,
          ...result.stations.slice(1).map((s, i) => s.position - result.stations[i].position),
          result.route.distanceKm - result.stations[result.stations.length - 1].position,
        ]
      : result
      ? [result.route.distanceKm]
      : [];

  const segments: Segment[] = result ? buildSegments(result.stations, gaps) : [];
  const lastGap = gaps[gaps.length - 1] ?? 0;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <a href="/" className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-gray-200 shadow-sm text-gray-600 hover:bg-gray-50 transition-colors text-lg">←</a>
        <div>
          <h1 className="text-xl font-black text-gray-900 leading-tight">Planificá tu viaje con tu eléctrico</h1>
          <p className="text-xs text-gray-400 mt-0.5">Cargadores en ruta · gap de autonomía · Argentina</p>
        </div>
      </div>

      {/* Collapsed summary */}
      {formCollapsed && result ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{from} → {to}</p>
            <p className="text-xs text-gray-400">Desvío máx. {radio} km · Autonomía {autonomy} km</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <ShareButton from={from} to={to} radio={radio} autonomy={autonomy} />
            <button onClick={() => setFormCollapsed(false)} className="text-sm text-green-600 hover:underline">
              Editar
            </button>
          </div>
        </div>
      ) : (
        /* Full form */
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs flex items-center justify-center font-bold flex-shrink-0">A</span>
              <CityInput
                value={from}
                onChange={(v) => { setFrom(v); setFromResolved(null); }}
                onSelect={(c) => { setFrom(c.display); setFromResolved(c); }}
                placeholder="Origen (ciudad, barrio...)"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs flex items-center justify-center font-bold flex-shrink-0">B</span>
              <CityInput
                value={to}
                onChange={(v) => { setTo(v); setToResolved(null); }}
                onSelect={(c) => { setTo(c.display); setToResolved(c); }}
                placeholder="Destino (ciudad, barrio...)"
                required
              />
            </div>
          </div>

          {/* Autonomy slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Mi autonomía</span>
              <span className="text-sm font-bold text-gray-800">{autonomy} km</span>
            </div>
            <input type="range" min={100} max={600} step={25} value={autonomy} onChange={(e) => setAutonomy(parseInt(e.target.value))} className="w-full accent-green-600 h-1.5 rounded-full cursor-pointer" />
            <div className="flex justify-between text-xs text-gray-300"><span>100 km</span><span>600 km</span></div>
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">Desvío máx.:</span>
              {[5, 10, 20].map((r) => (
                <button key={r} type="button" onClick={() => handleRadioChange(r)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${radio === r ? "bg-green-600 text-white border-green-600" : "border-gray-200 text-gray-600 hover:border-green-400"}`}>
                  {r} km
                </button>
              ))}
            </div>
            <button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
              {loading ? "Calculando..." : "Ver ruta"}
            </button>
          </div>
        </form>
      )}

      {/* Error */}
      {error ? (
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-800 mb-4">{error}</div>
      ) : null}

      {/* Loading */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3 animate-pulse">🗺️</div>
          <p className="text-sm">Calculando ruta y buscando cargadores...</p>
        </div>
      ) : null}

      {/* Results */}
      {result && !loading ? (
        <>
          {/* Route summary */}
          <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 mb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-green-700 font-medium truncate">{result.fromDisplay} → {result.toDisplay}</p>
                <p className="text-sm text-green-900 font-bold mt-0.5">{result.route.distanceKm} km · {formatDuration(result.route.durationMin)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-bold text-green-700">{result.stations.length}</div>
                <div className="text-xs text-green-600">cargador{result.stations.length !== 1 ? "es" : ""}</div>
              </div>
            </div>
          </div>

          {/* Map */}
          {result.geometry.length > 0 && coords ? (
            <div className="mb-3 overflow-hidden rounded-2xl shadow-sm border border-gray-100">
              <RouteMap
                geometry={result.geometry}
                stations={result.stations.filter((s) => s.lat && s.lng)}
                fromLatLng={[coords.from.lat, coords.from.lng]}
                toLatLng={[coords.to.lat, coords.to.lng]}
              />
            </div>
          ) : null}

          {/* Semaphore */}
          <Semaphore stations={result.stations} routeDistanceKm={result.route.distanceKm} autonomy={autonomy} />

          {/* Station list or empty state */}
          {result.stations.length > 0 ? (
            <div className="space-y-0.5">
              {segments.map((seg, segIdx) => (
                <div key={segIdx}>
                  {/* Gap before this segment */}
                  <GapIndicator
                    gapKm={seg.gapBefore}
                    autonomy={autonomy}
                    label={segIdx === 0 && seg.gapBefore >= 15 ? `${Math.round(seg.gapBefore)} km desde el inicio` : undefined}
                  />

                  {seg.stations.length === 1 ? (
                    /* Single station — show directly */
                    <div className="py-1"><StationCard station={seg.stations[0]} /></div>
                  ) : (
                    /* Multiple stations — first always visible, rest collapsible */
                    <div>
                      <div className="py-1"><StationCard station={seg.stations[0]} /></div>
                      <button
                        onClick={() => toggleSegment(segIdx)}
                        className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-xl px-3 py-2 my-1 transition-colors"
                      >
                        <span className="text-xs text-gray-500 font-medium">
                          {expandedSegments.has(segIdx)
                            ? "Ver menos"
                            : `Ver ${seg.stations.length - 1} opción${seg.stations.length - 1 !== 1 ? "es" : ""} más en esta zona`}
                        </span>
                        <span className="text-xs text-gray-400">
                          {expandedSegments.has(segIdx) ? "▲" : "▼"}
                        </span>
                      </button>
                      {expandedSegments.has(segIdx) ? (
                        <div className="space-y-1">
                          {seg.stations.slice(1).map((s) => (
                            <div key={s.id} className="py-1"><StationCard station={s} /></div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}

              {/* Gap after last segment → destination */}
              <GapIndicator
                gapKm={lastGap}
                autonomy={autonomy}
                label={lastGap >= 15 ? `${Math.round(lastGap)} km hasta el destino` : undefined}
              />

              <p className="text-xs text-center text-gray-400 pt-3">
                ¿Falta alguna?{" "}
                <a href="/agregar" className="text-green-600 hover:underline">Agregala →</a>
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-6 text-center">
              <div className="text-3xl mb-2">🔌</div>
              <p className="font-semibold text-gray-800">Sin cargadores en el corredor</p>
              <p className="text-sm text-gray-500 mt-1">
                Probá ampliando el desvío máximo a 20 km o{" "}
                <a href="/agregar" className="text-green-600 hover:underline">agregá una estación</a>.
              </p>
            </div>
          )}
        </>
      ) : null}

      {/* Idle */}
      {!result && !error && !loading ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">🗺️</div>
          <p className="text-sm">Ingresá origen y destino para ver<br />los cargadores en tu camino.</p>
        </div>
      ) : null}
    </div>
  );
}
