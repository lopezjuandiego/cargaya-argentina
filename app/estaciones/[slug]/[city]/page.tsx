import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { slugToProvince, cityToSlug } from "@/lib/provinces";

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
  lat: number;
  lng: number;
  connectorTypes: string;
  powerKw: number | null;
  isFree: boolean;
  lastStatus: "working" | "not_working" | null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; city: string }>;
}): Promise<Metadata> {
  const { slug, city: citySlug } = await params;
  const province = slugToProvince(slug);
  if (!province) return { title: "Ciudad no encontrada" };

  const sql = getDb();
  const rows = (await sql`
    SELECT DISTINCT city FROM "Station"
    WHERE province = ${province} AND city IS NOT NULL AND city <> ''
  `) as { city: string }[];

  const match = rows.find((r) => cityToSlug(r.city) === citySlug);
  if (!match) return { title: "Ciudad no encontrada" };

  return {
    title: `Cargadores eléctricos en ${match.city}, ${province}`,
    description: `Estaciones de carga para autos eléctricos en ${match.city}, ${province}, Argentina. Conectores, operadores y estado en tiempo real.`,
    alternates: {
      canonical: `https://dondecargar.com.ar/estaciones/${slug}/${citySlug}`,
    },
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ slug: string; city: string }>;
}) {
  const { slug, city: citySlug } = await params;
  const province = slugToProvince(slug);
  if (!province) notFound();

  const sql = getDb();

  // Find city name from slug
  const cityRows = (await sql`
    SELECT DISTINCT city FROM "Station"
    WHERE province = ${province} AND city IS NOT NULL AND city <> ''
    ORDER BY city
  `) as { city: string }[];

  const cityName = cityRows.find((r) => cityToSlug(r.city) === citySlug)?.city;
  if (!cityName) notFound();

  const stations = (await sql`
    SELECT id, name, operator, address, city, lat, lng,
           "connectorTypes", "powerKw", "isFree"
    FROM "Station"
    WHERE province = ${province} AND city = ${cityName}
    ORDER BY name
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

  const operators = [...new Set(stations.map((s) => s.operator))].slice(0, 3);
  const connectors = [...new Set(
    stations.flatMap((s) => {
      try { return JSON.parse(s.connectorTypes || "[]") as string[]; }
      catch { return []; }
    })
  )].slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Cargadores eléctricos en ${cityName}, ${province}`,
    description: `${stations.length} estaciones de carga para autos eléctricos en ${cityName}`,
    numberOfItems: stations.length,
    itemListElement: withStatus.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "ElectricVehicleChargingStation",
        name: s.name,
        address: {
          "@type": "PostalAddress",
          streetAddress: s.address,
          addressLocality: s.city,
          addressRegion: province,
          addressCountry: "AR",
        },
        geo: { "@type": "GeoCoordinates", latitude: s.lat, longitude: s.lng },
        url: `https://dondecargar.com.ar/estacion/${s.id}`,
      },
    })),
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4 flex-wrap">
        <a href="/estaciones" className="text-green-600 hover:underline">Provincias</a>
        <span>›</span>
        <a href={`/estaciones/${slug}`} className="text-green-600 hover:underline">{province}</a>
        <span>›</span>
        <span className="text-gray-600">{cityName}</span>
      </div>

      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">
          Cargadores eléctricos en {cityName}
        </h1>
        <p className="text-gray-500 mt-1">
          {stations.length} estación{stations.length !== 1 ? "es" : ""} · {province}
        </p>
        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
          {cityName} tiene {stations.length} estación{stations.length !== 1 ? "es" : ""} de carga
          para vehículos eléctricos.
          {operators.length > 0 && ` Operadores presentes: ${operators.join(", ")}.`}
          {connectors.length > 0 && ` Conectores disponibles: ${connectors.join(", ")}.`}
        </p>
      </div>

      <div className="space-y-3">
        {withStatus.map((s) => {
          const connList: string[] = JSON.parse(s.connectorTypes || "[]");
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
                    {s.isFree ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium">Gratis</span>
                    ) : null}
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
              {connList.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mt-2">
                  {connList.map((c) => (
                    <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c}</span>
                  ))}
                </div>
              )}
            </a>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 space-y-2 text-center">
        <p className="text-sm text-gray-500">
          ¿Falta alguna?{" "}
          <a href="/agregar" className="text-green-600 hover:underline">Agregala →</a>
        </p>
        <p className="text-xs text-gray-300">
          <a href={`/estaciones/${slug}`} className="hover:underline">Ver todas las estaciones en {province}</a>
        </p>
      </div>
    </div>
  );
}
