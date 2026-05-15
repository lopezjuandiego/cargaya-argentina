"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
        <input
          value={title}
          onChange={(e) => { setTitle(e.target.value); if (!isEdit) setSlug(slugify(e.target.value)); }}
          placeholder="Cómo planificar un viaje en auto eléctrico..."
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">/blog/</span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Resumen (excerpt) *</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          placeholder="Una o dos oraciones que resuman el artículo..."
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
      </div>

      {/* Content */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">Contenido (Markdown) *</label>
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="text-xs text-green-600 hover:underline"
          >
            {preview ? "✎ Editar" : "👁 Vista previa"}
          </button>
        </div>
        {preview ? (
          <div
            className="min-h-64 border border-gray-200 rounded-xl p-4 prose prose-sm max-w-none text-gray-700 bg-gray-50"
            dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br>") }}
          />
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            placeholder="## Introducción&#10;&#10;Escribí el artículo en Markdown..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
          />
        )}
        <p className="text-xs text-gray-400 mt-1">Usá Markdown: **negrita**, ## títulos, - listas, [link](url)</p>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>}

      <div className="flex items-center gap-3 pt-2 flex-wrap">
        <button
          onClick={() => save(true)}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
        >
          {saving ? "Guardando..." : published ? "Actualizar" : "Publicar"}
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
      </div>
    </div>
  );
}
