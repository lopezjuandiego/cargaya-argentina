import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { ShareButtons } from "./ShareButtons";

marked.setOptions({ breaks: true });

const ALLOWED_TAGS = [
  "h1","h2","h3","h4","h5","h6","p","br","hr","strong","em","del","code","pre",
  "blockquote","ul","ol","li","a","img","table","thead","tbody","tr","th","td",
  "figure","figcaption","div","span",
];

function sanitize(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: (_, attribs) => ({
        tagName: "a",
        attribs: { ...attribs, rel: "noopener noreferrer" },
      }),
    },
  });
}

export const dynamic = "force-dynamic";

type Post = {
  id: number; title: string; slug: string; excerpt: string;
  content: string; publishedAt: string;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const sql = getDb();
  const rows = await sql`SELECT title, excerpt, slug FROM "BlogPost" WHERE slug = ${slug} AND published = true`;
  const post = rows[0] as Pick<Post, "title" | "excerpt" | "slug"> | undefined;
  if (!post) return { title: "Artículo no encontrado" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: "article" },
    alternates: { canonical: `https://dondecargar.com.ar/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sql = getDb();
  const rows = await sql`
    SELECT id, title, slug, excerpt, content, "publishedAt"
    FROM "BlogPost" WHERE slug = ${slug} AND published = true
  `;
  const post = rows[0] as Post | undefined;
  if (!post) notFound();

  const raw = await marked(post.content, { async: true });
  const html = sanitize(raw as string);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    publisher: {
      "@type": "Organization",
      name: "DóndeCargar",
      url: "https://dondecargar.com.ar",
    },
    url: `https://dondecargar.com.ar/blog/${post.slug}`,
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
        <a href="/" className="text-green-600 hover:underline">Inicio</a>
        <span>›</span>
        <a href="/blog" className="text-green-600 hover:underline">Blog</a>
        <span>›</span>
        <span className="text-gray-500 truncate max-w-xs">{post.title}</span>
      </div>

      <article>
        <p className="text-xs text-gray-400 mb-2">
          {new Date(post.publishedAt).toLocaleDateString("es-AR", {
            day: "numeric", month: "long", year: "numeric",
          })}
        </p>
        <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-3">{post.title}</h1>
        <p className="text-lg text-gray-500 leading-relaxed mb-8 border-b border-gray-100 pb-6">
          {post.excerpt}
        </p>

        {/* Rendered markdown */}
        <div
          className="blog-content text-gray-700 text-[0.95rem]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>

      <ShareButtons title={post.title} slug={post.slug} />

      <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
        <p className="text-sm text-gray-600">
          ¿Buscás cargadores cerca tuyo?{" "}
          <a href="/" className="text-green-600 font-medium hover:underline">
            Usá el mapa de DóndeCargar →
          </a>
        </p>
        <p className="text-xs text-gray-400">
          <a href="/blog" className="hover:underline">← Volver al blog</a>
        </p>
      </div>
    </div>
  );
}
