import BlogEditor from "../BlogEditor";

export default function NuevoPostPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin/blog" className="text-sm text-gray-400 hover:text-green-600">← Blog</a>
        <h1 className="text-xl font-bold text-gray-900">Nuevo artículo</h1>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <BlogEditor />
      </div>
    </div>
  );
}
