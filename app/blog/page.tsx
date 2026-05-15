import type { Metadata } from "next";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog – Guías sobre autos eléctricos en Argentina",
  description:
    "Guías, consejos y noticias sobre vehículos eléctricos en Argentina: cómo cargar, cuánto cuesta, mejores rutas y redes de carga.",
  alternates: { canonical: "https://dondecargar.com.ar/blog" },
};

type Post = { id: number; title: string; slug: string; excerpt: string; publishedAt: string };

export default async function BlogPage() {
  const sql = getDb();
  const posts = (await sql`
    SELECT id, title, slug, excerpt, "publishedAt"
    FROM "BlogPost"
    WHERE published = true
    ORDER BY "publishedAt" DESC
  `) as Post[];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 min-h-screen">
      <a href="/" className="text-sm text-green-600 hover:underline">← Inicio</a>

      <div className="mt-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Blog</h1>
        <p className="text-gray-500 mt-2">
          Guías sobre autos eléctricos, carga y movilidad sostenible en Argentina.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-400">Próximamente — estamos preparando los primeros artículos.</p>
      ) : (
        <div className="space-y-6">
          {posts.map((p) => (
            <a
              key={p.id}
              href={`/blog/${p.slug}`}
              className="block group"
            >
              <article className="border-b border-gray-100 pb-6">
                <p className="text-xs text-gray-400 mb-1">
                  {new Date(p.publishedAt).toLocaleDateString("es-AR", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
                <h2 className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors leading-snug">
                  {p.title}
                </h2>
                <p className="text-gray-500 mt-2 leading-relaxed">{p.excerpt}</p>
                <span className="text-sm text-green-600 font-medium mt-2 inline-block group-hover:underline">
                  Leer artículo →
                </span>
              </article>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
