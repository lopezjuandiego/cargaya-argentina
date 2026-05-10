"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GpsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function locate() {
    if (!navigator.geolocation) {
      setError("GPS no disponible");
      return;
    }
    setLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        router.push(`/buscar?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`);
      },
      (err) => {
        setLoading(false);
        if (err.code === 1) setError("Permiso denegado");
        else setError("No se pudo obtener ubicación");
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={locate}
        disabled={loading}
        className="flex-shrink-0 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap"
      >
        {loading ? "Buscando..." : "📍 Usar mi ubicación"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
