"use client";
import { useRouter } from "next/navigation";

export default function BackLink() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-600 mb-4 text-sm"
    >
      ← Volver
    </button>
  );
}
