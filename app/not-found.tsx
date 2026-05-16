import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página no encontrada",
  description: "Esta página se quedó sin batería.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-white">

      {/* Batería vacía animada */}
      <div className="relative mb-6">
        <svg
          viewBox="0 0 80 40"
          className="w-32 h-16 text-gray-200"
          fill="none"
          aria-hidden="true"
        >
          {/* cuerpo de la batería */}
          <rect x="1" y="4" width="68" height="32" rx="5" ry="5" stroke="currentColor" strokeWidth="3" />
          {/* terminal */}
          <rect x="70" y="14" width="8" height="12" rx="2" fill="currentColor" />
          {/* relleno vacío — solo queda la punta verde */}
          <rect x="5" y="8" width="10" height="24" rx="3" fill="#16a34a" />
        </svg>
        {/* ⚡ encima */}
        <span className="absolute inset-0 flex items-center justify-center text-3xl select-none">⚡</span>
      </div>

      {/* Código */}
      <p className="text-8xl font-black text-green-600 leading-none tracking-tight mb-2">404</p>

      {/* Headline */}
      <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-1">
        Esta página se quedó sin batería
      </h1>

      {/* Chiste */}
      <p className="text-gray-500 text-base max-w-xs leading-relaxed mb-1">
        Buscaste algo que no existe... justo cuando más lo necesitabas.
        <br />
        Igual que un cargador en la Ruta 3.
      </p>

      {/* Branding */}
      <p className="text-xs text-gray-400 mb-8 mt-2">
        — DóndeCargar, el GPS de las enchufadas 🔌
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <a
          href="/"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-5 rounded-2xl transition-colors text-sm text-center"
        >
          Volver al inicio
        </a>
        <a
          href="/buscar"
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-5 rounded-2xl transition-colors text-sm text-center"
        >
          Buscar cargadores
        </a>
      </div>
    </div>
  );
}
