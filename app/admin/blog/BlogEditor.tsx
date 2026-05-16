"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { marked } from "marked";

type Post = {
  id?: number; title: string; slug: string; excerpt: string;
  content: string; published: boolean;
};

function slugify(t: string) {
  return t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100);
}

export default function BlogEditor({ post }: { post?: Post & { id: number } }) {
  const isEdit = !!post?.id;
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [published, setPublished] = useState(post?.published ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");

  async function togglePreview() {
    if (!preview) {
      const html = await marked(content, { async: true });
      setPreviewHtml(html as string);
    }
    setPreview(!preview);
  }

  async function save(pub: boolean) {
    setSaving(true);
    setError("");
    const body = { title, slug: slug || slugify(title), excerpt, content, published: pub };
    const url = isEdit ? `/api/admin/blog/${post.id}` : "/api/admin/blog";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    if (res.ok) {
      router.push("/admin/blog");
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.error ?? "Error");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      {/* Fila superior: título + slug + excerpt */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
          <input
            value={title}
            onChange={(e) => { setTitle(e.target.value); if (!isEdit) setSlug(slugify(e.target.value)); }}
            placeholder="Cómo planificar un viaje en auto eléctrico..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 whitespace-nowrap">/blog/</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Resumen (excerpt)</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            placeholder="Una o dos oraciones que resuman el artículo..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>
      </div>

      {/* Editor / Preview en dos columnas si hay espacio */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Contenido (Markdown) *</label>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">{content.length} caracteres</span>
            <button
              type="button"
              onClick={togglePreview}
              className="text-xs font-medium text-green-600 hover:underline"
            >
              {preview ? "✎ Solo editor" : "👁 Vista previa"}
            </button>
          </div>
        </div>

        {preview ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <textarea
              value={content}
              onChange={(e) => { setContent(e.target.value); marked(e.target.value, { async: true }).then((h) => setPreviewHtml(h as string)); }}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              style={{ minHeight: "600px" }}
            />
            <div
              className="border border-gray-100 rounded-xl p-5 bg-gray-50 overflow-auto prose prose-green prose-sm max-w-none text-gray-700
                prose-headings:font-bold prose-headings:text-gray-900
                prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-2
                prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-1
                prose-p:mb-3 prose-li:mb-1
                prose-a:text-green-600
                prose-strong:text-gray-900"
              style={{ minHeight: "600px" }}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
            style={{ minHeight: "600px" }}
            placeholder={"## Introducción\n\nEscribí el artículo en Markdown...\n\n## Segunda sección\n\n![Descripción de la foto](https://url-de-tu-imagen.jpg)"}
          />
        )}

        {/* Cheatsheet rápida */}
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
          {[
            ["**negrita**", "negrita"],
            ["## Título", "título H2"],
            ["### Subtítulo", "H3"],
            ["- ítem", "lista"],
            ["[texto](url)", "link"],
            ["![alt](url)", "foto"],
            ["---", "separador"],
            ["> texto", "cita"],
          ].map(([code, label]) => (
            <span key={code} className="text-xs text-gray-400">
              <code className="bg-gray-100 px-1 rounded text-gray-600">{code}</code> {label}
            </span>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>}

      <div className="flex items-center gap-3 pt-2 flex-wrap border-t border-gray-100">
        <button
          onClick={() => save(true)}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
        >
          {saving ? "Guardando..." : isEdit ? "Actualizar" : "Publicar"}
        </button>
        <button
          onClick={() => save(false)}
          disabled={saving}
          className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-medium px-6 py-2.5 rounded-xl transition-colors text-sm"
        >
          Guardar borrador
        </button>
        <a href="/admin/blog" className="text-sm text-gray-400 hover:text-gray-600">
          Cancelar
        </a>
        {isEdit && (
          <a
            href={`/blog/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-sm text-green-600 hover:underline"
          >
            Ver publicado →
          </a>
        )}
      </div>
    </div>
  );
}
