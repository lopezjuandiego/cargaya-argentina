import { getStation, getStatusReports } from "@/lib/stations";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import StatusForm from "./StatusForm";
import BackLink from "./BackLink";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const station = await getStation(parseInt(id, 10));
  if (!station) return { title: "Estación no encontrada" };

  const connectors: string[] = JSON.parse(station.connectorTypes || "[]");
  const connectorStr = connectors.length ? ` · Conectores: ${connectors.join(", ")}` : "";

  return {
    title: `${station.name} – Cargador en ${station.city}`,
    description: `Estación de carga eléctrica ${station.operator} en ${station.address}, ${station.city}, ${station.province}${connectorStr}. Verificá disponibilidad en DóndeCargar.`,
    openGraph: {
      title: `${station.name} – ${station.city}`,
      description: `${station.operator} · ${station.address}, ${station.city}, ${station.province}`,
    },
    alternates: {
      canonical: `https://dondecargar.com.ar/estacion/${id}`,
    },
  };
}

const CONNECTOR_INFO: Record<string, string> = {
  "Tipo 2": "Tipo 2 (AC) — el más común en Europa y Argentina. Carga lenta/media, hasta 22 kW. Compatible con la mayoría de los autos eléctricos.",
  "CCS2": "CCS2 (DC) — carga rápida, desde 50 hasta 350 kW. Estándar europeo. Compatible con la mayoría de los EVs modernos.",
  "CHAdeMO": "CHAdeMO (DC) — carga rápida japonesa, hasta 100 kW. Usado por Nissan, Mitsubishi y modelos asiáticos.",
  "GBT": "GB/T (DC/AC) — estándar chino. Usado en BYD, Chery, y otros autos de origen chino.",
  "Tesla": "Tesla Supercharger — propio de Tesla. En algunos países ya permite otros autos con adaptador CCS2.",
  "Schuko": "Schuko (AC) — enchufe doméstico europeo. Carga muy lenta (~2 kW), solo para emergencias.",
};

const CATEGORY_INFO: Record<string, string> = {
  "Hotel": "Cargador en hotel — generalmente accesible para huéspedes y en algunos casos al público general.",
  "Restaurante": "Cargador en restaurante — para cargar mientras comés. Verificá si requiere consumir.",
  "Supermercado": "Cargador en supermercado — podés cargar mientras hacés las compras.",
  "Shopping": "Cargador en shopping o centro comercial — acceso público durante el horario comercial.",
  "Parking": "Estacionamiento con carga — puede requerir pago de estacionamiento.",
  "Aeropuerto": "Cargador en aeropuerto — disponible en playa de estacionamiento.",
  "Terminal / Puerto": "Cargador en terminal o puerto — acceso variable según operatoria.",
  "Estación de servicio": "Gasolinera con carga eléctrica — similar a cargar combustible, acceso público.",
  "Autopista": "Cargador en autopista — pensado para viajes de larga distancia, parada rápida.",
  "Deporte / Entretenimiento": "Cargador en club o espacio recreativo — puede requerir ser socio o cliente.",
};

export default async function StationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const station = await getStation(parseInt(id, 10));
  if (!station) notFound();

  const reports = await getStatusReports(station.id);
  const connectors: string[] = JSON.parse(station.connectorTypes || "[]");

  const lastReport = reports[0];
  const statusLabel = lastReport ? (lastReport.isWorking ? "Funciona" : "Sin funcionar") : "Sin reportes";
  const statusColor = lastReport
    ? lastReport.isWorking ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
    : "text-gray-500 bg-gray-50";

  const addedDate = new Date(station.createdAt).toLocaleDateString("es-AR", {
    day: "numeric", month: "long", year: "numeric"
  });
  const noReportsTooltip = `Ningún usuario reportó el estado todavía. Esta estación fue agregada el ${addedDate}.`;

  const BASE = "https://dondecargar.com.ar";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ElectricVehicleChargingStation",
    name: station.name,
    description: `Estación de carga eléctrica ${station.operator} en ${station.address}, ${station.city}, ${station.province}, Argentina.`,
    url: `${BASE}/estacion/${station.id}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: station.address,
      addressLocality: station.city,
      addressRegion: station.province,
      addressCountry: "AR",
      ...(station.postalCode ? { postalCode: station.postalCode } : {}),
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: station.lat,
      longitude: station.lng,
    },
    ...(station.powerKw ? { electricVehicleChargingDuration: `PT${Math.round(200 / station.powerKw)}H` } : {}),
    openingHours: "Mo-Su 00:00-24:00",
    isAccessibleForFree: station.isFree,
    amenityFeature: connectors.map((c) => ({
      "@type": "LocationFeatureSpecification",
      name: `Conector ${c}`,
      value: true,
    })),
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BackLink />

      {/* Card principal */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">

        {/* Status badge */}
        <div
          title={!lastReport ? noReportsTooltip : undefined}
          className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full cursor-default ${statusColor}`}
        >
          <span>{lastReport ? (lastReport.isWorking ? "✓" : "✗") : "?"}</span>
          {statusLabel}
          {!lastReport && <span className="text-gray-400 text-xs ml-1">ⓘ</span>}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{station.name}</h1>
          <p className="text-gray-600 mt-1 font-medium">{station.address}, {station.city}</p>
          <p className="text-gray-400 text-sm mt-0.5">{station.province}{station.postalCode ? ` (${station.postalCode})` : ""}</p>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          <InfoBox label="Operador" value={station.operator} />
          <InfoBox
            label="Tipo de lugar"
            value={station.category ?? "—"}
            tooltip={station.category ? CATEGORY_INFO[station.category] : undefined}
          />
          <InfoBox
            label="Potencia"
            value={station.powerKw ? `${station.powerKw} kW` : "—"}
            tooltip={station.powerKw ? `${station.powerKw} kW — ${station.powerKw >= 100 ? "Carga ultra-rápida: carga completa en ~30 min" : station.powerKw >= 50 ? "Carga rápida: ~1h para carga completa" : station.powerKw >= 22 ? "Carga media: 3-6hs para carga completa" : "Carga lenta: 8-12hs para carga completa"}` : undefined}
          />
          <InfoBox label="Acceso" value={station.isFree ? "Gratuito" : "Pago"} />
        </div>

        {/* Conectores */}
        {connectors.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Conectores</p>
            <div className="flex flex-wrap gap-2">
              {connectors.map((c) => {
                const info = CONNECTOR_INFO[c] ?? `Conector tipo ${c}`;
                return (
                  <span key={c} className="relative group/tip inline-block">
                    <span className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full font-medium cursor-help select-none inline-block">
                      {c}
                    </span>
                    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tip:block z-20 w-64 bg-gray-900 text-white text-xs rounded-xl px-3 py-2.5 leading-snug text-center shadow-lg">
                      {info}
                      <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Google Maps */}
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-2xl font-semibold transition-colors shadow-sm"
        >
          Cómo llegar →
        </a>
        <p className="text-xs text-gray-400 text-center">
          La dirección en Google Maps puede diferir del nombre del lugar, pero las coordenadas apuntan al sitio correcto.
        </p>
      </div>

      {/* Reportar estado */}
      <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-1">¿Esta estación funciona?</h2>
        <p className="text-xs text-gray-400 mb-3">Tu reporte ayuda a otros usuarios a saber si vale la pena ir.</p>
        <StatusForm stationId={station.id} />
      </div>

      {/* Historial */}
      {reports.length > 0 && (
        <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Reportes recientes</h2>
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r.id} className="flex gap-3 items-start text-sm">
                <span className={r.isWorking ? "text-green-500" : "text-red-500"}>
                  {r.isWorking ? "✓" : "✗"}
                </span>
                <div>
                  <span className={r.isWorking ? "text-green-700 font-medium" : "text-red-700 font-medium"}>
                    {r.isWorking ? "Funciona" : "Sin funcionar"}
                  </span>
                  {r.comment && <p className="text-gray-500 mt-0.5">{r.comment}</p>}
                  <p className="text-gray-400 text-xs mt-0.5">
                    {new Date(r.reportedAt).toLocaleDateString("es-AR", {
                      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {station.notes && (
        <div className="mt-4 bg-yellow-50 rounded-2xl border border-yellow-100 p-4">
          <p className="text-sm text-yellow-800"><span className="font-medium">Nota:</span> {station.notes}</p>
        </div>
      )}
    </div>
  );
}

function InfoBox({ label, value, tooltip }: { label: string; value: string; tooltip?: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
      <p
        className={`text-gray-900 font-medium mt-0.5 ${tooltip ? "cursor-help underline decoration-dotted decoration-gray-400" : ""}`}
        title={tooltip}
      >
        {value}
        {tooltip && <span className="text-gray-400 text-xs ml-1">ⓘ</span>}
      </p>
    </div>
  );
}
