"use client";

import { useState, useEffect } from "react";

const TYPES = [
  { value: "bug", label: "Bug / algo roto" },
  { value: "sugerencia", label: "Sugerencia" },
  { value: "estacion", label: "Problema con una estación" },
  { value: "general", label: "Otro" },
];

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("general");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [page, setPage] = useState("");

  useEffect(() => { setPage(window.location.pathname); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, message, email: email || null, page }),
    });
    setSending(false);
    setDone(true);
  }

  function handleClose() {
    setOpen(false);
    setTimeout(() => { setDone(false); setMessage(""); setEmail(""); setType("general"); }, 300);
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-full shadow-lg transition-all flex items-center gap-1.5"
        aria-label="Dejar feedback"
      >
        💬 Feedback
      </button>

      {/* Backdrop */}
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={handleClose}
        />
      ) : null}

      {/* Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="max-w-lg mx-auto px-5 py-5 max-h-[85vh] overflow-y-auto">
          {/* Handle */}
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

          {done ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">🙌</div>
              <p className="font-bold text-gray-900 text-lg">¡Gracias!</p>
              <p className="text-gray-500 text-sm mt-1">Tu feedback nos ayuda a mejorar DóndeCargar.</p>
              <button
                onClick={handleClose}
                className="mt-5 text-sm text-green-600 hover:underline"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900">¿Algún problema o sugerencia?</h2>
                <button type="button" onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
              </div>

              {/* Type */}
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      type === t.value
                        ? "bg-gray-800 text-white border-gray-800"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Message */}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Contanos qué pasó o qué mejorarías..."
                rows={4}
                required
                maxLength={2000}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />

              {/* Email (optional) */}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu email (opcional — para que te respondamos)"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />

              <button
                type="submit"
                disabled={sending || !message.trim()}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {sending ? "Enviando..." : "Enviar feedback"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
