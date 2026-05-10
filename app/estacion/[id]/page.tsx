import { getStation, getStatusReports } from "@/lib/stations";
import { notFound } from "next/navigation";
import StatusForm from "./StatusForm";

export default async function StationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const station = await getStation(parseInt(id, 10));
  if (!station) notFound();

  const reports = await getStatusReports(station.id);
  const connectors: string[] = JSON.parse(station.connectorTypes || "[]");

  const lastReport = reports[0];
  const statusLabel = lastReport
    ? lastReport.isWorking
      ? "Funciona"
      : "Sin funcionar"
    : "Sin reportes";
  const statusColor = lastReport
    ? lastReport.isWorking
      ? "text-green-600 bg-green-50"
      : "text-red-600 bg-red-50"
    : "text-gray-500 bg-gray-50";

  return (
    <div className="max-w-lg mx-auto px-4 py-6 min-h-screen">
      {/* Back */}
      <a href="javascript:history.back()" className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-600 mb-4 text-sm">
        ← Volver
      </a>

      {/* Card principal */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        {/* Status badge */}
        <div className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full ${statusColor}`}>
          <span>{lastReport ? (lastReport.isWorking ? "✓" : "✗") : "?"}</span>
          {statusLabel}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{station.name}</h1>
          <p className="text-gray-500 mt-1">{station.address}, {station.city}</p>
          <p className="text-gray-400 text-sm">{station.province} {station.postalCode ? `(${station.postalCode})` : ""}</p>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          <InfoBox label="Operador" value={station.operator} />
          <InfoBox label="Categoría" value={station.category ?? "—"} />
          <InfoBox label="Potencia" value={station.powerKw ? `${station.powerKw} kW` : "—"} />
          <InfoBox label="Acceso" value={station.isFree ? "Gratuito" : "Pago"} />
        </div>

        {/* Conectores */}
        {connectors.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Conectores</p>
            <div className="flex flex-wrap gap-2">
              {connectors.map((c) => (
                <span key={c} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full font-medium">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Google Maps link */}
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors"
        >
          🗺️ Cómo llegar
        </a>
      </div>

      {/* Reportar estado */}
      <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-3">¿Esta estación funciona?</h2>
        <StatusForm stationId={station.id} />
      </div>

      {/* Historial de reportes */}
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

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-gray-900 font-medium mt-0.5">{value}</p>
    </div>
  );
}
