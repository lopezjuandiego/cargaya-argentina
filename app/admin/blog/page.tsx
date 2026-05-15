import { getDb } from "@/lib/db";
import { AdminLogout } from "../AdminClient";

export const dynamic = "force-dynamic";

type Post = { id: number; title: string; slug: string; published: boolean; publishedAt: string | null; createdAt: string };

export default async function AdminBlogPage() {
  const sql = getDb();
  const posts = (await sql`
    SELECT id, title, slug, published, "publishedAt", "createdAt"
    FROM "BlogPost" ORDER BY "createdAt" DESC
  `) as Post[];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Blog</h1>
          <p className="text-xs text-gray-400">DóndeCargar · Gestión de artículos</p>
        </div>
        <AdminLogout />
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{posts.length} artículo{posts.length !== 1 ? "s" : ""}</p>
        <a
          href="/admin/blog/nuevo"
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          + Nuevo artículo
        </a>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">✍️</div>
          <p className="text-sm">No hay artículos todavía.</p>
          <a href="/admin/blog/nuevo" className="text-green-600 hover:underline text-sm mt-2 inline-block">
            Crear el primero →
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {p.published ? "Publicado" : "Borrador"}
                  </span>
                </div>
                <p className="font-semibold text-gray-900 text-sm truncate">{p.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  /blog/{p.slug} ·{" "}
                  {new Date(p.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {p.published && (
                  <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-green-600">Ver</a>
                )}
                <a href={`/admin/blog/${p.id}`}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors">
                  Editar
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-gray-100 flex gap-4 text-sm text-gray-400">
        <a href="/admin" className="hover:text-green-600">← Volver al admin</a>
        <a href="/" className="hover:text-green-600">Sitio</a>
      </div>
    </div>
  );
}
