"use client";

import { useRouter } from "next/navigation";

export default function BlogDeleteButton({ id }: { id: number }) {
  const router = useRouter();
  async function del() {
    if (!confirm("¿Eliminás este artículo? Esta acción no se puede deshacer.")) return;
    await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    router.push("/admin/blog");
    router.refresh();
  }
  return (
    <button onClick={del} className="text-xs text-red-400 hover:text-red-600 transition-colors">
      Eliminar
    </button>
  );
}
