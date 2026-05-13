"use client";

import { useState } from "react";

// ─── Local city lookup (O(1), no network) ────────────────────────────────────
// Keys are lowercase, no accents. Covers capitals, GBA, turismo y costa.
const AR_CITIES: Record<string, { lat: number; lng: number; display: string }> = {
  // Capitales provinciales
  "buenos aires": { lat: -34.6037, lng: -58.3816, display: "Buenos Aires" },
  "caba": { lat: -34.6037, lng: -58.3816, display: "Buenos Aires" },
  "cordoba": { lat: -31.4135, lng: -64.1811, display: "Córdoba, Córdoba" },
  "rosario": { lat: -32.9442, lng: -60.6505, display: "Rosario, Santa Fe" },
  "mendoza": { lat: -32.8908, lng: -68.8272, display: "Mendoza, Mendoza" },
  "la plata": { lat: -34.9215, lng: -57.9545, display: "La Plata, Buenos Aires" },
  "tucuman": { lat: -26.8083, lng: -65.2176, display: "San Miguel de Tucumán, Tucumán" },
  "san miguel de tucuman": { lat: -26.8083, lng: -65.2176, display: "San Miguel de Tucumán" },
  "salta": { lat: -24.7821, lng: -65.4232, display: "Salta, Salta" },
  "santa fe": { lat: -31.6333, lng: -60.7000, display: "Santa Fe, Santa Fe" },
  "san juan": { lat: -31.5375, lng: -68.5364, display: "San Juan, San Juan" },
  "resistencia": { lat: -27.4606, lng: -58.9867, display: "Resistencia, Chaco" },
  "neuquen": { lat: -38.9516, lng: -68.0591, display: "Neuquén, Neuquén" },
  "corrientes": { lat: -27.4806, lng: -58.8341, display: "Corrientes, Corrientes" },
  "posadas": { lat: -27.3671, lng: -55.8961, display: "Posadas, Misiones" },
  "bahia blanca": { lat: -38.7183, lng: -62.2663, display: "Bahía Blanca, Buenos Aires" },
  "parana": { lat: -31.7333, lng: -60.5333, display: "Paraná, Entre Ríos" },
  "santiago del estero": { lat: -27.7951, lng: -64.2615, display: "Santiago del Estero" },
  "formosa": { lat: -26.1775, lng: -58.1781, display: "Formosa, Formosa" },
  "san luis": { lat: -33.3027, lng: -66.3375, display: "San Luis, San Luis" },
  "jujuy": { lat: -24.1858, lng: -65.2995, display: "San Salvador de Jujuy, Jujuy" },
  "san salvador de jujuy": { lat: -24.1858, lng: -65.2995, display: "San Salvador de Jujuy" },
  "viedma": { lat: -40.8135, lng: -62.9967, display: "Viedma, Río Negro" },
  "rawson": { lat: -43.3002, lng: -65.1023, display: "Rawson, Chubut" },
  "rio gallegos": { lat: -51.6230, lng: -69.2168, display: "Río Gallegos, Santa Cruz" },
  "ushuaia": { lat: -54.8019, lng: -68.3030, display: "Ushuaia, Tierra del Fuego" },
  "santa rosa": { lat: -36.6167, lng: -64.2903, display: "Santa Rosa, La Pampa" },
  // Turismo y costa
  "bariloche": { lat: -41.1335, lng: -71.3103, display: "Bariloche, Río Negro" },
  "san carlos de bariloche": { lat: -41.1335, lng: -71.3103, display: "Bariloche, Río Negro" },
  "mar del plata": { lat: -38.0023, lng: -57.5575, display: "Mar del Plata, Buenos Aires" },
  "villa gesell": { lat: -37.2636, lng: -56.9706, display: "Villa Gesell, Buenos Aires" },
  "pinamar": { lat: -37.1102, lng: -56.8681, display: "Pinamar, Buenos Aires" },
  "mar de las pampas": { lat: -37.3167, lng: -56.9667, display: "Mar de las Pampas, Buenos Aires" },
  "miramar": { lat: -38.2701, lng: -57.8372, display: "Miramar, Buenos Aires" },
  "necochea": { lat: -38.5555, lng: -58.7390, display: "Necochea, Buenos Aires" },
  "monte hermoso": { lat: -38.9872, lng: -61.2983, display: "Monte Hermoso, Buenos Aires" },
  "villa carlos paz": { lat: -31.4222, lng: -64.4975, display: "Villa Carlos Paz, Córdoba" },
  "carlos paz": { lat: -31.4222, lng: -64.4975, display: "Villa Carlos Paz, Córdoba" },
  "villa la angostura": { lat: -40.7581, lng: -71.6475, display: "Villa La Angostura, Neuquén" },
  "san martin de los andes": { lat: -40.1564, lng: -71.3542, display: "San Martín de los Andes" },
  "mendoza capital": { lat: -32.8908, lng: -68.8272, display: "Mendoza, Mendoza" },
  "comodoro rivadavia": { lat: -45.8648, lng: -67.4979, display: "Comodoro Rivadavia, Chubut" },
  "puerto madryn": { lat: -42.7692, lng: -65.0385, display: "Puerto Madryn, Chubut" },
  "el calafate": { lat: -50.3402, lng: -72.2647, display: "El Calafate, Santa Cruz" },
  // GBA y Gran Buenos Aires
  "olivos": { lat: -34.5048, lng: -58.4944, display: "Olivos, Buenos Aires" },
  "san isidro": { lat: -34.4736, lng: -58.5271, display: "San Isidro, Buenos Aires" },
  "vicente lopez": { lat: -34.5260, lng: -58.4758, display: "Vicente López, Buenos Aires" },
  "tigre": { lat: -34.4260, lng: -58.5797, display: "Tigre, Buenos Aires" },
  "quilmes": { lat: -34.7206, lng: -58.2544, display: "Quilmes, Buenos Aires" },
  "avellaneda": { lat: -34.6653, lng: -58.3656, display: "Avellaneda, Buenos Aires" },
  "lanus": { lat: -34.7012, lng: -58.3934, display: "Lanús, Buenos Aires" },
  "lomas de zamora": { lat: -34.7613, lng: -58.4036, display: "Lomas de Zamora, Buenos Aires" },
  "moron": { lat: -34.6522, lng: -58.6197, display: "Morón, Buenos Aires" },
  "pilar": { lat: -34.4587, lng: -58.9143, display: "Pilar, Buenos Aires" },
  "lujan": { lat: -34.5697, lng: -59.1036, display: "Luján, Buenos Aires" },
  "san justo": { lat: -34.6773, lng: -58.5578, display: "San Justo, Buenos Aires" },
  "haedo": { lat: -34.6439, lng: -58.5919, display: "Haedo, Buenos Aires" },
  "palermo": { lat: -34.5875, lng: -58.4266, display: "Palermo, Buenos Aires" },
  "belgrano": { lat: -34.5637, lng: -58.4578, display: "Belgrano, Buenos Aires" },
  "recoleta": { lat: -34.5875, lng: -58.3930, display: "Recoleta, Buenos Aires" },
  "microcentro": { lat: -34.6076, lng: -58.3712, display: "Microcentro, Buenos Aires" },
  // Interior bonaerense
  "chascomus": { lat: -35.5667, lng: -58.0167, display: "Chascomús, Buenos Aires" },
  "dolores": { lat: -36.3167, lng: -57.6833, display: "Dolores, Buenos Aires" },
  "general madariaga": { lat: -37.0000, lng: -57.1167, display: "General Madariaga, Buenos Aires" },
  "pergamino": { lat: -33.8899, lng: -60.5716, display: "Pergamino, Buenos Aires" },
  "junin": { lat: -34.5833, lng: -60.9500, display: "Junín, Buenos Aires" },
  "mercedes": { lat: -34.6500, lng: -59.4333, display: "Mercedes, Buenos Aires" },
  "chivilcoy": { lat: -34.8977, lng: -60.0218, display: "Chivilcoy, Buenos Aires" },
  // Córdoba interior
  "villa maria": { lat: -32.4077, lng: -63.2429, display: "Villa María, Córdoba" },
  "rio cuarto": { lat: -33.1232, lng: -64.3493, display: "Río Cuarto, Córdoba" },
  "san francisco": { lat: -31.4284, lng: -62.0820, display: "San Francisco, Córdoba" },
  "alta gracia": { lat: -31.6552, lng: -64.4317, display: "Alta Gracia, Córdoba" },
};

function normalizeKey(s: string): string {
  return s.toLowerCase().trim().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ");
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const row = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = row[j];
      row[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, row[j], row[j - 1]);
      prev = temp;
    }
  }
  return row[n];
}

function lookupCity(q: string): { lat: number; lng: number; display: string } | null {
  const key = normalizeKey(q);

  // Exact match first
  if (AR_CITIES[key]) return AR_CITIES[key];

  // Fuzzy match: allow 1 edit for ≤8 chars, 2 for longer
  const maxDist = key.length <= 8 ? 1 : 2;
  let best: { lat: number; lng: number; display: string } | null = null;
  let bestDist = maxDist + 1;

  for (const [cityKey, cityData] of Object.entries(AR_CITIES)) {
    const d = levenshtein(key, cityKey);
    if (d < bestDist) { bestDist = d; best = cityData; }
  }
  return bestDist <= maxDist ? best : null;
}

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

  // Safe gap — subtle, just informational
  return (
    <div className="flex items-center gap-2 py-2">
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-xs text-gray-300 whitespace-nowrap">{text}</span>
      <div className="flex-1 h-px bg-gray-100" />
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
  fromDisplay: string;
  toDisplay: string;
};

type GeoCoords = { from: GeoResult; to: GeoResult };

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Main component ───────────────────────────────────────────────────────────

export default function RutaClient() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [radio, setRadio] = useState(10);
  const [autonomy, setAutonomy] = useState(300);
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

    const [fromGeo, toGeo] = await Promise.all([geocode(from.trim()), geocode(to.trim())]);

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
      setResult({ stations: data.stations, route: data.route, fromDisplay: fromGeo.display, toDisplay: toGeo.display });
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
          <h1 className="text-lg font-bold text-gray-900">Ruta con cargadores</h1>
          <p className="text-xs text-gray-400">Estaciones en el camino entre dos puntos</p>
        </div>
      </div>

      {/* Collapsed summary */}
      {formCollapsed && result ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{from} → {to}</p>
            <p className="text-xs text-gray-400">Desvío máx. {radio} km · Autonomía {autonomy} km</p>
          </div>
          <button onClick={() => setFormCollapsed(false)} className="text-sm text-green-600 hover:underline flex-shrink-0">
            Editar
          </button>
        </div>
      ) : (
        /* Full form */
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs flex items-center justify-center font-bold flex-shrink-0">A</span>
              <input type="text" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Origen (ciudad, barrio...)" className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" required />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs flex items-center justify-center font-bold flex-shrink-0">B</span>
              <input type="text" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Destino (ciudad, barrio...)" className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" required />
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
