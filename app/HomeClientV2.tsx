"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { searchCities, type CityResult } from "@/lib/cities";

export default function HomeClientV2({ stationCount, lastUpdated }: { stationCount: number; lastUpdated: string }) {
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
    if (!navigator.geolocation) { setError("Ingresá una ciudad o zona."); return; }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => router.push(`/buscar?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`),
      (err) => {
        setLocating(false);
        setError(err.code === 1 ? "Permiso de ubicación denegado." : "No pudimos obtener tu ubicación.");
      },
      { timeout: 12000, enableHighAccuracy: false, maximumAge: 60000 }
    );
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    const q = encodeURIComponent(query.trim());
    navigator.geolocation?.getCurrentPosition(
      (pos) => router.push(`/buscar?q=${q}&lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`),
      () => router.push(`/buscar?q=${q}`),
      { timeout: 3000, enableHighAccuracy: false, maximumAge: 120000 }
    );
    router.push(`/buscar?q=${q}`);
  }

  return (
    <main className="flex flex-col flex-1 min-h-screen bg-[#0c0c0c] text-white">

      {/* Nav top */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="text-green-400 text-xl font-bold">⚡</span>
          <span className="font-semibold text-white text-sm tracking-tight">DóndeCargar</span>
          <span className="text-[10px] font-semibold bg-green-900/60 text-green-400 px-1.5 py-0.5 rounded-full border border-green-800">Beta</span>
        </div>
        <div className="flex items-center gap-5 text-sm text-gray-400">
          <a href="/ruta" className="text-green-400 hover:text-green-300 font-semibold transition-colors">Planificar viaje</a>
          <a href="/blog" className="hover:text-white transition-colors">Blog</a>
          <a href="/agregar" className="hover:text-white transition-colors">Agregar</a>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-16 pt-8">
        <div className="w-full max-w-xl text-center space-y-8">

          {/* Headline */}
          <div className="space-y-3">
            <p className="text-green-400 text-sm font-semibold tracking-widest uppercase">
              {stationCount}+ estaciones en Argentina
            </p>
            <h1 className="text-[1.9rem] min-[480px]:text-[2.4rem] sm:text-[2.9rem] font-black text-white leading-tight tracking-tight">
              <span className="block whitespace-nowrap">Encontrá dónde cargar</span>
              <span className="text-green-400 whitespace-nowrap">tu auto eléctrico</span>
            </h1>
            <p className="text-gray-400 text-lg">
              El directorio más completo de cargadores eléctricos en Argentina.
            </p>
          </div>

          {/* Search */}
          <div className="space-y-3">
            <form onSubmit={handleSearch}>
              <div ref={searchRef} className="relative">
                <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-5 py-4 gap-3 focus-within:border-green-500 focus-within:bg-white/8 transition-all">
                  <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSugg(true)}
                    placeholder="Palermo, San Isidro, Mar del Plata..."
                    autoComplete="off"
                    className="flex-1 bg-transparent text-white placeholder-gray-500 text-base focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-xl text-sm transition-colors flex-shrink-0"
                  >
                    Buscar
                  </button>
                </div>

                {showSugg && suggestions.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-left">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); selectCity(s); }}
                        className="w-full text-left px-5 py-3.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-3 border-b border-white/5 last:border-0 transition-colors"
                      >
                        <span className="text-green-400 text-xs">⚡</span>
                        {s.display}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </form>

            {/* GPS */}
            <button
              onClick={useGPS}
              disabled={locating}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-white/10 text-gray-300 hover:border-green-500/50 hover:text-white text-sm font-medium transition-all bg-white/5 hover:bg-white/8"
            >
              {locating ? (
                <><span className="animate-spin text-base">⏳</span> Obteniendo ubicación...</>
              ) : (
                <>
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Usar mi ubicación actual
                </>
              )}
            </button>

            {error && (
              <p className="text-red-400 text-sm bg-red-900/20 border border-red-900/40 rounded-xl px-4 py-2">{error}</p>
            )}
          </div>

          {/* Planner CTA */}
          <a
            href="/ruta"
            className="block w-full border border-white/10 hover:border-green-500/50 rounded-2xl px-5 py-4 bg-white/5 hover:bg-green-950/40 transition-all text-left group"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-white font-bold text-sm group-hover:text-green-400 transition-colors">
                  Planificá tu viaje con tu eléctrico
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  Calculá cargadores en ruta y gaps de autonomía
                </p>
              </div>
              <span className="text-green-500 text-xl flex-shrink-0 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </a>

          {/* Quick links */}
          <div className="flex gap-3 justify-center flex-wrap">
            <a href="/blog" className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-400 transition-colors">
              <span>📖</span> Guías EV
            </a>
            <span className="text-white/10">·</span>
            <a href="/agregar" className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-400 transition-colors">
              <span>+</span> Agregar estación
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 w-full max-w-xl">
          <div className="grid grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
            {[
              { value: `${stationCount}`, label: "Estaciones" },
              { value: "7+", label: "Redes" },
              { value: "24", label: "Provincias" },
            ].map((s) => (
              <div key={s.label} className="bg-[#0c0c0c] px-4 py-5 text-center">
                <div className="text-2xl font-black text-green-400">{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5 font-medium tracking-wide uppercase">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-4 text-center">
        <p className="text-xs text-gray-600">
          Datos: Open Charge Map · YPF · Chargebox · Scame · comunidad
          {lastUpdated && ` · Actualizado: ${lastUpdated}`}
          {" · "}
          <a href="/terminos" className="hover:text-gray-400 transition-colors">Términos</a>
          {" · "}
          <a href="/privacidad" className="hover:text-gray-400 transition-colors">Privacidad</a>
        </p>
      </footer>
    </main>
  );
}
