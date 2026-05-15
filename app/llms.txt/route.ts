import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const sql = getDb();

  const [countRow, provinceRows] = await Promise.all([
    sql`SELECT COUNT(*)::int AS n FROM "Station"`,
    sql`
      SELECT province, COUNT(*)::int AS n
      FROM "Station"
      WHERE province IS NOT NULL AND province <> '' AND province <> 'Rocha'
      GROUP BY province ORDER BY n DESC LIMIT 10
    `,
  ]);

  const total = (countRow[0] as { n: number }).n;
  const provinces = (provinceRows as { province: string; n: number }[])
    .map((r) => `  - ${r.province}: ${r.n} estaciones`)
    .join("\n");

  const content = `# CargaYa

> Directorio de estaciones de carga para vehículos eléctricos en Argentina

## Descripción

CargaYa es un directorio comunitario y gratuito de estaciones de carga eléctrica para autos eléctricos (EVs) en Argentina. Permite buscar cargadores por ubicación GPS, por ciudad o planificar rutas A→B mostrando los cargadores disponibles en el corredor.

## Datos actuales

- Total de estaciones: ${total}
- Cobertura: todo el territorio argentino
- Provincias con más estaciones:
${provinces}

## Operadores incluidos

- YPF Punto Eléctrico (red de estaciones de servicio YPF)
- Chargebox (red privada, shopping centers y hoteles)
- Scame Parre (concesionarias y espacios comerciales)
- EPEC (empresa provincial de energía de Córdoba — Puntos E)
- Shell Recharge
- Enel X Way
- ACA (Automóvil Club Argentino)
- Estaciones aportadas por la comunidad

## Funcionalidades

- Búsqueda por ubicación GPS o nombre de ciudad/barrio
- Planificador de rutas A→B con estaciones en el corredor (desvío configurable)
- Semáforo de viabilidad de viaje según autonomía del vehículo
- Detección de gaps críticos (tramos sin cargadores)
- Reporte comunitario de estado (funciona / no funciona)
- Páginas indexables por provincia

## URLs principales

- Home: https://cargaya-argentina.vercel.app
- Planificador de rutas: https://cargaya-argentina.vercel.app/ruta
- Estaciones por provincia: https://cargaya-argentina.vercel.app/estaciones
- Estaciones en Buenos Aires: https://cargaya-argentina.vercel.app/estaciones/buenos-aires
- Estaciones en Córdoba: https://cargaya-argentina.vercel.app/estaciones/cordoba
- Agregar estación: https://cargaya-argentina.vercel.app/agregar
- Sitemap: https://cargaya-argentina.vercel.app/sitemap.xml

## Fuentes de datos

- Open Charge Map (OCM) — https://openchargemap.org — datos abiertos bajo CC BY-SA
- API pública de YPF Punto Eléctrico
- Google My Maps KML de Scame Parre Argentina
- Datos manuales de EPEC, ACA y comunidad

## Tecnología

- Next.js 16 App Router (Vercel)
- Base de datos: Neon PostgreSQL (serverless)
- Rutas: OSRM (Project OSRM, datos OpenStreetMap)
- Geocodificación: Nominatim / OpenStreetMap

## Contacto

lopezjuandiego@gmail.com
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
