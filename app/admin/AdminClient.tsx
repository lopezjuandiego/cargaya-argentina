"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Submission = {
  id: number;
  name: string;
  operator: string | null;
  address: string;
  city: string;
  province: string;
  lat: number | null;
  lng: number | null;
  connectorTypes: string;
  powerKw: number | null;
  comment: string | null;
  submittedAt: string;
};

function SubmissionCard({ sub }: { sub: Submission }) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const connectors: string[] = JSON.parse(sub.connectorTypes || "[]");
  const hasCoords = sub.lat !== null && sub.lng !== null;

  async function act(action: "approve" | "reject") {
    setLoading(action);
    setError("");
    const res = await fetch(`/api/admin/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: sub.id }),
    });
    const data = await res.json();
    if (res.ok) {
      setDone(action === "approve" ? "approved" : "rejected");
      router.refresh();
    } else {
      setError(data.error ?? "Error");
    }
    setLoading(null);
  }

  if (done) {
    return (
      <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${done === "approved" ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
        {done === "approved" ? "✓ Aprobada y publicada" : "✗ Rechazada"} — <span className="font-normal">{sub.name}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-gray-900 text-base">{sub.name}</h2>
          {sub.operator && <p className="text-sm text-gray-500">{sub.operator}</p>}
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">
          {new Date(sub.submittedAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Dirección</p>
          <p className="text-gray-800">{sub.address}</p>
          <p className="text-gray-500">{sub.city}, {sub.province}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Coordenadas</p>
          {hasCoords ? (
            <a
              href={`https://www.google.com/maps?q=${sub.lat},${sub.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              {sub.lat!.toFixed(4)}, {sub.lng!.toFixed(4)} ↗
            </a>
          ) : (
            <p className="text-amber-600 text-sm">⚠️ Sin coordenadas</p>
          )}
        </div>
        {sub.powerKw && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Potencia</p>
            <p className="text-gray-800">{sub.powerKw} kW</p>
          </div>
        )}
        {connectors.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Conectores</p>
            <p className="text-gray-800">{connectors.join(", ")}</p>
          </div>
        )}
      </div>

      {sub.comment && (
        <div className="bg-gray-50 rounded-xl px-3 py-2 text-sm text-gray-600 italic">
          "{sub.comment}"
        </div>
      )}

      {!hasCoords && (
        <p className="text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
          Para aprobar necesitás coordenadas. Buscá la dirección en Google Maps, copiá las coordenadas y actualizá la DB manualmente.
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button
          onClick={() => act("approve")}
          disabled={loading !== null || !hasCoords}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
        >
          {loading === "approve" ? "Aprobando..." : "✓ Aprobar"}
        </button>
        <button
          onClick={() => act("reject")}
          disabled={loading !== null}
          className="flex-1 bg-red-50 hover:bg-red-100 disabled:opacity-40 text-red-600 font-semibold py-2.5 rounded-xl transition-colors border border-red-200 text-sm"
        >
          {loading === "reject" ? "Rechazando..." : "✗ Rechazar"}
        </button>
      </div>
    </div>
  );
}

export function AdminLogout() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }
  return (
    <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
      Cerrar sesión
    </button>
  );
}

export function SubmissionList({ submissions }: { submissions: Submission[] }) {
  if (submissions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="text-4xl mb-3">🎉</div>
        <p className="text-sm">No hay estaciones pendientes de revisión.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {submissions.map((sub) => (
        <SubmissionCard key={sub.id} sub={sub} />
      ))}
    </div>
  );
}
