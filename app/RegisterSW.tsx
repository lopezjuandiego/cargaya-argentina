"use client";
import { useEffect, useState } from "react";

export default function RegisterSW() {
  const [prompt, setPrompt] = useState<Event & { prompt?: () => void } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const handler = (e: Event) => {
      e.preventDefault();
      if (!window.matchMedia("(max-width: 768px)").matches) return;
      setPrompt(e as Event & { prompt?: () => void });
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!prompt || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-gray-900 text-white rounded-2xl shadow-2xl p-4 flex items-center gap-3 max-w-sm mx-auto">
      <span className="text-2xl flex-shrink-0">⚡</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">Instalá DóndeCargar</p>
        <p className="text-xs text-gray-400 mt-0.5">Acceso rápido desde tu pantalla de inicio</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={() => setDismissed(true)}
          className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1"
        >
          No, gracias
        </button>
        <button
          onClick={() => { prompt.prompt?.(); setDismissed(true); }}
          className="text-xs bg-green-500 hover:bg-green-400 text-black font-bold px-3 py-1.5 rounded-xl"
        >
          Instalar
        </button>
      </div>
    </div>
  );
}
