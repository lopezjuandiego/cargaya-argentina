"use client";

import { useRouter } from "next/navigation";

const CONECTORES = ["CCS2", "Tipo 2", "CHAdeMO", "NACS"];

export default function Filtros({
  lat, lng, q, radio, gratis, conector,
}: {
  lat?: string; lng?: string; q?: string;
  radio: number; gratis: boolean; conector: string;
}) {
  const router = useRouter();

  function navigate(updates: { gratis?: boolean; conector?: string }) {
    const p = new URLSearchParams();
    if (lat && lng) { p.set("lat", lat); p.set("lng", lng); }
    else if (q) p.set("q", q);
    p.set("radio", String(radio));
    const newGratis = updates.gratis !== undefined ? updates.gratis : gratis;
    const newConector = updates.conector !== undefined ? updates.conector : conector;
    if (newGratis) p.set("gratis", "1");
    if (newConector) p.set("conector", newConector);
    router.push(`/buscar?${p.toString()}`);
  }

  const hasFilters = gratis || !!conector;

  return (
    <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
      <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">Filtrar:</span>
      <button
        onClick={() => navigate({ gratis: !gratis })}
        className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
          gratis ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
        }`}
      >
        Gratis
      </button>
      {CONECTORES.map((c) => (
        <button
          key={c}
          onClick={() => navigate({ conector: conector === c ? "" : c })}
          className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
            conector === c ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
          }`}
        >
          {c}
        </button>
      ))}
      {hasFilters && (
        <button
          onClick={() => navigate({ gratis: false, conector: "" })}
          className="flex-shrink-0 text-xs px-2 py-1.5 rounded-full text-gray-400 hover:text-red-500 transition-colors"
        >
          ✕ Quitar
        </button>
      )}
    </div>
  );
}
