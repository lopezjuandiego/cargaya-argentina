"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { searchCities, type CityResult } from "@/lib/cities";

export default function HomeClient({ stationCount, lastUpdated }: { stationCount: number; lastUpdated: string }) {
  const router = useRouter();
  const [locating, setLocating] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<CityResult[]>([]);
  const [showSugg, setShowSugg] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOut(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSugg(false);
    }
    document.addEventListener("mousedown", onClickOut);
    return () => document.removeEventListener("mousedown", onClickOut);
  }, []);

  function handleQueryChange(v: string) {
    setQuery(v);
    const r = searchCities(v);
    setSuggestions(r);
    setShowSugg(r.length > 0);
  }

  function selectCity(city: CityResult) {
    setQuery(city.display);
    setSuggestions([]);
    setShowSugg(false);
    navigator.geolocation?.getCurrentPosition(
      (pos) => router.push(`/buscar?q=${encodeURIComponent(city.display)}&lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`),
      () => router.push(`/buscar?q=${encodeURIComponent(city.display)}&lat=${city.lat}&lng=${city.lng}`)
    );
  }

  function useGPS() {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización. Ingresá una ciudad o zona.");
      return;
    }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        router.push(`/buscar?lat=${latitude}&lng=${longitude}`);
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) {
          setError("Permiso denegado. En tu browser buscá el ícono de ubicación en la barra de dirección y desbloqueá el permiso.");
        } else if (err.code === 2) {
          setError("No se pudo determinar tu ubicación. Activá el GPS o probá desde otro dispositivo.");
        } else if (err.code === 3) {
          setError("Tardó demasiado. Intentá de nuevo o buscá por ciudad.");
        } else {
          setError("No pudimos obtener tu ubicación. Ingresá una ciudad o zona.");
        }
      },
      { timeout: 12000, enableHighAccuracy: false, maximumAge: 60000 }
    );
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    const q = encodeURIComponent(query.trim());
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          router.push(`/buscar?q=${q}&lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`);
        },
        () => {
          router.push(`/buscar?q=${q}`);
        },
        { timeout: 3000, enableHighAccuracy: false, maximumAge: 120000 }
      );
    } else {
      router.push(`/buscar?q=${q}`);
    }
  }

  return (
    <main className="flex flex-col flex-1 items-center justify-center px-4 py-16 bg-gradient-to-b from-green-50 to-gray-100 min-h-screen">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Logo / Header */}
        <div>
          <div className="text-6xl mb-4">⚡</div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">CargaYa</h1>
            <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200 tracking-wide">
              Beta
            </span>
          </div>
          <p className="mt-3 text-gray-500 text-lg leading-snug">
            Encontrá la estación de carga eléctrica<br className="hidden sm:block" /> más cercana en Argentina
          </p>
        </div>

        {/* GPS Button */}
        <div className="space-y-4">
          <button
            onClick={useGPS}
            disabled={locating}
            className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-4 px-6 rounded-2xl text-lg transition-colors shadow-sm"
          >
            {locating ? (
              <>
                <span className="animate-spin">⏳</span>
                Obteniendo ubicación...
              </>
            ) : (
              <>
                <span>📍</span>
                Usar mi ubicación actual
              </>
            )}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-sm text-gray-400">o buscá por zona</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Text Search with autocomplete */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div ref={searchRef} className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSugg(true)}
                placeholder="Palermo, San Isidro, Mar del Plata..."
                autoComplete="off"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              />
              {showSugg && suggestions.length > 0 ? (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden text-left">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); selectCity(s); }}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-green-50 flex items-center gap-2 border-b border-gray-50 last:border-0 transition-colors"
                    >
                      <span className="text-gray-300 text-xs">📍</span>
                      <span className="text-gray-800">{s.display}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button
              type="submit"
              className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-3 rounded-xl font-medium transition-colors"
            >
              Buscar
            </button>
          </form>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-2">{error}</p>
          )}

          <a
            href="/ruta"
            className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-2xl px-4 py-3 bg-white hover:border-green-400 hover:text-green-700 hover:bg-green-50 transition-all shadow-sm w-full"
          >
            🗺️ Planificá tu ruta A→B
            <span className="text-gray-300 text-xs ml-auto">→</span>
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            { value: `${stationCount}`, label: "Estaciones" },
            { value: "7+", label: "Redes" },
            { value: "24", label: "Provincias" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
              <div className="font-bold text-green-700 text-xl">{s.value}</div>
              <div className="text-gray-400 text-xs mt-0.5 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Link to add */}
        <p className="text-sm text-gray-400">
          ¿Conocés una estación que no está?{" "}
          <a href="/agregar" className="text-green-600 font-medium hover:underline">
            Agregala acá
          </a>
        </p>

        {/* Data sources */}
        <div className="pt-2 border-t border-gray-200 space-y-1">
          <p className="text-xs text-gray-400">
            Datos de{" "}
            <a href="https://openchargemap.org" target="_blank" rel="noopener noreferrer" className="hover:underline">
              Open Charge Map
            </a>
            {" · "}
            <a href="https://mapa.ypf.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
              YPF Punto Eléctrico
            </a>
            {" · "}
            <a href="https://www.chargebox.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
              Chargebox
            </a>
            {" · "}
            comunidad
          </p>
          {lastUpdated && (
            <p className="text-xs text-gray-300">Última actualización: {lastUpdated}</p>
          )}
          <p className="text-xs text-gray-300 pt-1">
            <a href="/terminos" className="hover:underline">Términos de uso</a>
            {" · "}
            <a href="/privacidad" className="hover:underline">Privacidad</a>
          </p>
        </div>
      </div>
    </main>
  );
}
