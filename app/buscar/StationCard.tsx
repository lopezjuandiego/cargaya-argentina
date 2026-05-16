"use client";

import { useState } from "react";

const CONNECTOR_INFO: Record<string, string> = {
  "Tipo 2": "AC (hasta 43 kW) · Compatible: VW ID.4, Fiat 500e, Renault Kangoo ZE, Peugeot e-208, BMW i3...",
  "CCS2": "Carga rápida DC (hasta 350 kW) · Compatible: VW ID.4, BMW iX, Audi e-tron, Peugeot e-208, Fiat 500e...",
  "CHAdeMO": "Carga rápida DC · Compatible: Nissan Leaf, Mitsubishi Outlander PHEV...",
  "NACS": "Tesla / SAE J3400 · Compatible con todos los Tesla y nuevos modelos con adaptador",
  "CCS1": "Carga rápida DC (estándar americano) · Compatible con algunos modelos americanos y asiáticos",
  "Tipo 1": "AC (hasta 7.4 kW) · Compatible: Nissan Leaf (gen 1), algunos modelos asiáticos y americanos",
  "Tesla SC": "Supercharger Tesla · Exclusivo para vehículos Tesla",
  "Tesla": "Conector Tesla (Roadster)",
  "Tipo 3": "AC europeo antiguo · Poco común en Argentina",
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
  const [copied, setCopied] = useState(false);
  const connectors: string[] = JSON.parse(s.connectorTypes || "[]");
  const operatorClass = OPERATOR_COLORS[s.operator] ?? OPERATOR_COLORS.default;
  const stationUrl = `https://dondecargar.com.ar/estacion/${s.id}`;
  const waText = `${s.name} — ${s.address}, ${s.city}\nCargador eléctrico en DóndeCargar: ${stationUrl}`;

  function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(stationUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

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
            <ConnectorBadge key={c} type={c} />
          ))}
        </div>
      )}

      {/* Botones compartir */}
      <div className="flex gap-2 mt-3 pt-2.5 border-t border-gray-50">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(waText)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#25D366] transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </a>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          {copied ? (
            <>
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current fill-none stroke-2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              ¡Copiado!
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current fill-none stroke-2" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Copiar link
            </>
          )}
        </button>
      </div>
    </a>
  );
}
