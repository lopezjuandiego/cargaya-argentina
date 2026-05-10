"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StatusForm({ stationId }: { stationId: number }) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [comment, setComment] = useState("");

  async function report(isWorking: boolean) {
    setSending(true);
    await fetch("/api/reportar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stationId, isWorking, comment: comment || null }),
    });
    setSending(false);
    setDone(true);
    router.refresh();
  }

  if (done) {
    return (
      <div className="text-center py-3 text-green-600 font-medium">
        ¡Gracias por tu reporte! 🙌
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <button
          onClick={() => report(true)}
          disabled={sending}
          className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          ✓ Funciona
        </button>
        <button
          onClick={() => report(false)}
          disabled={sending}
          className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          ✗ No funciona
        </button>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Comentario opcional (colas, precio, estado, etc.)"
        rows={2}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
      />
    </div>
  );
}
