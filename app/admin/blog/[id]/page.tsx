import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import BlogEditor from "../BlogEditor";
import BlogDeleteButton from "./BlogDeleteButton";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sql = getDb();
  const rows = await sql`SELECT * FROM "BlogPost" WHERE id = ${parseInt(id)}`;
  const post = rows[0] as {
    id: number; title: string; slug: string; excerpt: string; content: string; published: boolean;
  } | undefined;
  if (!post) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <a href="/admin/blog" className="text-sm text-gray-400 hover:text-green-600">← Blog</a>
          <h1 className="text-xl font-bold text-gray-900">Editar artículo</h1>
        </div>
        <BlogDeleteButton id={post.id} />
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <BlogEditor post={post} />
      </div>
    </div>
  );
}
