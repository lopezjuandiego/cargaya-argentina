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

type Station = {
  id: number;
  name: string;
  operator: string;
  address: string;
  city: string;
  connectorTypes: string;
  powerKw: number | null;
  isFree: number;
  distanceKm?: number;
  lastStatus: "working" | "not_working" | null;
};

export default function StationCard({
  station: s,
  highlight = false,
}: {
  station: Station;
  highlight?: boolean;
}) {
  const connectors: string[] = JSON.parse(s.connectorTypes || "[]");
  const operatorClass = OPERATOR_COLORS[s.operator] ?? OPERATOR_COLORS.default;

  return (
    <a
      href={`/estacion/${s.id}`}
      className={`block bg-white rounded-2xl border p-4 hover:border-green-300 hover:shadow-md transition-all ${
        highlight
          ? "border-green-400 shadow-md ring-1 ring-green-200"
          : "border-gray-100 shadow-sm"
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
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium">
                Gratis
              </span>
            ) : null}
          </div>
          <h2 className="font-semibold text-gray-900 text-base leading-tight truncate">
            {s.name}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5 truncate">
            {s.address}, {s.city}
          </p>
        </div>
        <div className="text-right flex-shrink-0 pl-2">
          {s.distanceKm !== undefined && (
            <div className="text-green-600 font-bold text-base">
              {formatDistance(s.distanceKm)}
            </div>
          )}
          {s.powerKw && (
            <div className="text-xs text-gray-400 mt-0.5">{s.powerKw} kW</div>
          )}
        </div>
      </div>
      {connectors.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mt-2.5">
          {connectors.map((c) => (
            <span
              key={c}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
            >
              {c}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}
