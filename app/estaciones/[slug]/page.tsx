import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { slugToProvince } from "@/lib/provinces";

export const dynamic = "force-dynamic";

const OPERATOR_COLORS: Record<string, string> = {
  Chargebox: "bg-blue-100 text-blue-700",
  YPF: "bg-yellow-100 text-yellow-700",
  "Shell Recharge": "bg-orange-100 text-orange-700",
  Scame: "bg-purple-100 text-purple-700",
  "Enel X": "bg-green-100 text-green-700",
  default: "bg-gray-100 text-gray-700",
};

type Station = {
  id: number;
  name: string;
  operator: string;
  address: string;
  city: string;
  connectorTypes: string;
  powerKw: number | null;
  isFree: boolean;
  lastStatus: "working" | "not_working" | null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const province = slugToProvince(slug);
  if (!province) return { title: "Provincia no encontrada" };

  return {
    title: `Cargadores eléctricos en ${province}`,
    description: `Listado completo de estaciones de carga para autos eléctricos en ${province}, Argentina. Encontrá el cargador más cercano a vos.`,
    alternates: {
      canonical: `https://cargaya-argentina.vercel.app/estaciones/${slug}`,
    },
  };
}

export default async function ProvincePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const province = slugToProvince(slug);
  if (!province) notFound();

  const sql = getDb();
  const stations = (await sql`
    SELECT id, name, operator, address, city, "connectorTypes", "powerKw", "isFree"
    FROM "Station"
    WHERE province = ${province}
    ORDER BY city, name
  `) as Omit<Station, "lastStatus">[];

  if (stations.length === 0) notFound();

  // Batch last status
  const ids = stations.map((s) => s.id);
  const reports = (await sql`
    SELECT DISTINCT ON ("stationId") "stationId", "isWorking"
    FROM "StatusReport"
    WHERE "stationId" = ANY(${ids})
    ORDER BY "stationId", "reportedAt" DESC
  `) as { stationId: number; isWorking: boolean }[];

  const statusMap = new Map(reports.map((r) => [r.stationId, r.isWorking]));

  const withStatus: Station[] = stations.map((s) => ({
    ...s,
    lastStatus: statusMap.has(s.id)
      ? statusMap.get(s.id) ? "working" : "not_working"
      : null,
  }));

  // Group by city
  const byCity = new Map<string, Station[]>();
  for (const s of withStatus) {
    const city = s.city || "Sin ciudad";
    if (!byCity.has(city)) byCity.set(city, []);
    byCity.get(city)!.push(s);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 min-h-screen">
      <a href="/estaciones" className="text-sm text-green-600 hover:underline">← Todas las provincias</a>

      <div className="mt-4 mb-5">
        <h1 className="text-2xl font-bold text-gray-900">
          Cargadores eléctricos en {province}
        </h1>
        <p className="text-gray-500 mt-1">
          {stations.length} estación{stations.length !== 1 ? "es" : ""} de carga en {byCity.size} ciudad{byCity.size !== 1 ? "es" : ""}
        </p>
        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
          {province} cuenta con {stations.length} estaciones de carga para vehículos eléctricos,
          distribuidas en {Array.from(byCity.keys()).slice(0, 3).join(", ")}
          {byCity.size > 3 ? ` y ${byCity.size - 3} localidad${byCity.size - 3 !== 1 ? "es" : ""} más` : ""}.
          Incluye redes como{" "}
          {[...new Set(stations.map((s) => s.operator))].slice(0, 3).join(", ")}.
          Todos los datos son verificados por la comunidad de DóndeCargar.
        </p>
      </div>

      <div className="space-y-6">
        {Array.from(byCity.entries()).map(([city, cityStations]) => (
          <div key={city}>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-2">
              {city} · {cityStations.length} estación{cityStations.length !== 1 ? "es" : ""}
            </h2>
            <div className="space-y-2">
              {cityStations.map((s) => {
                const connectors: string[] = JSON.parse(s.connectorTypes || "[]");
                const opColor = OPERATOR_COLORS[s.operator] ?? OPERATOR_COLORS.default;
                return (
                  <a
                    key={s.id}
                    href={`/estacion/${s.id}`}
                    className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-green-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${opColor}`}>
                            {s.operator}
                          </span>
                          {s.lastStatus === "working" && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">✓ Funciona</span>
                          )}
                          {s.lastStatus === "not_working" && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">✗ Sin funcionar</span>
                          )}
                          {s.isFree && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium">Gratis</span>
                          )}
                        </div>
                        <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{s.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{s.address}</p>
                      </div>
                      {s.powerKw ? (
                        <div className="text-right flex-shrink-0 pl-2">
                          <div className="text-xs text-gray-400">{s.powerKw} kW</div>
                        </div>
                      ) : null}
                    </div>
                    {connectors.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mt-2">
                        {connectors.map((c) => (
                          <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c}</span>
                        ))}
                      </div>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-2">
        <p className="text-sm text-gray-500">
          ¿No encontrás tu zona?{" "}
          <a href="/" className="text-green-600 hover:underline">Buscá por ubicación →</a>
        </p>
        <p className="text-xs text-gray-300">
          <a href="/agregar" className="hover:underline">Agregar una estación</a>
        </p>
      </div>
    </div>
  );
}
