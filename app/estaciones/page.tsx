import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import { provinceToSlug } from "@/lib/provinces";

export const metadata: Metadata = {
  title: "Cargadores eléctricos por provincia – Argentina",
  description:
    "Encontrá estaciones de carga para autos eléctricos en cada provincia de Argentina. Buenos Aires, Córdoba, Mendoza, Santa Fe y más.",
};

export const dynamic = "force-dynamic";

export default async function EstacionesPage() {
  const sql = getDb();
  const rows = (await sql`
    SELECT province, COUNT(*)::int AS n
    FROM "Station"
    WHERE province IS NOT NULL AND province <> '' AND province <> 'Rocha'
    GROUP BY province
    ORDER BY n DESC
  `) as { province: string; n: number }[];

  const total = rows.reduce((acc, r) => acc + r.n, 0);

  return (
    <div className="max-w-lg mx-auto px-4 py-8 min-h-screen">
      <a href="/" className="text-sm text-green-600 hover:underline">← Volver al inicio</a>

      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cargadores por provincia</h1>
        <p className="text-gray-500 mt-1">{total} estaciones en Argentina</p>
      </div>

      <div className="space-y-2">
        {rows.map((r) => {
          const slug = provinceToSlug(r.province);
          return (
            <a
              key={r.province}
              href={`/estaciones/${slug}`}
              className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 hover:border-green-300 hover:shadow-md transition-all"
            >
              <div>
                <p className="font-semibold text-gray-900">{r.province}</p>
                <p className="text-sm text-gray-400">
                  {r.n} estación{r.n !== 1 ? "es" : ""}
                </p>
              </div>
              <span className="text-gray-300 text-lg">→</span>
            </a>
          );
        })}
      </div>

      <p className="text-xs text-center text-gray-300 mt-8">
        ¿Conocés una estación que no está?{" "}
        <a href="/agregar" className="text-green-600 hover:underline">Agregala →</a>
      </p>
    </div>
  );
}
