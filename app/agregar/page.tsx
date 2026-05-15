"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PROVINCES = [
  "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba",
  "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja",
  "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan",
  "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero",
  "Tierra del Fuego", "Tucumán",
];

const CONNECTORS = ["Tipo 2", "CCS2", "CHAdeMO", "GBT", "Tesla", "Schuko"];

export default function AgregarPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", operator: "", address: "", city: "", province: "Buenos Aires",
    connectorTypes: [] as string[], powerKw: "", comment: "",
  });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleConnector(c: string) {
    setForm((f) => ({
      ...f,
      connectorTypes: f.connectorTypes.includes(c)
        ? f.connectorTypes.filter((x) => x !== c)
        : [...f.connectorTypes, c],
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.address || !form.city) {
      setError("Completá nombre, dirección y ciudad.");
      return;
    }
    setSending(true);
    const res = await fetch("/api/agregar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, powerKw: form.powerKw || null }),
    });
    const data = await res.json();
    if (data.ok) {
      setDone(true);
    } else {
      setError(data.error ?? "Error al enviar");
    }
    setSending(false);
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🙌</div>
        <h1 className="text-2xl font-bold text-gray-900">¡Gracias por contribuir!</h1>
        <p className="text-gray-500 mt-2">Tu envío fue recibido y lo revisaremos pronto.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 min-h-screen">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-600 mb-4 text-sm"
      >
        ← Volver
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Agregar estación</h1>
        <p className="text-sm text-gray-500 mb-5">
          Tu aporte será revisado antes de publicarse. ¡Gracias por contribuir!
        </p>

        <form onSubmit={submit} className="space-y-4">
          <Field label="Nombre del lugar *" required>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ej: Carrefour Palermo"
              className={inputClass}
              required
            />
          </Field>

          <Field label="Operador / Red">
            <input
              value={form.operator}
              onChange={(e) => set("operator", e.target.value)}
              placeholder="Ej: Chargebox, YPF, Shell Recharge"
              className={inputClass}
            />
          </Field>

          <Field label="Dirección *" required>
            <input
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Ej: Av. Córdoba 1234"
              className={inputClass}
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Ciudad *" required>
              <input
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Ej: CABA"
                className={inputClass}
                required
              />
            </Field>
            <Field label="Provincia *">
              <select
                value={form.province}
                onChange={(e) => set("province", e.target.value)}
                className={inputClass}
              >
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Potencia (kW)">
            <input
              type="number"
              value={form.powerKw}
              onChange={(e) => set("powerKw", e.target.value)}
              placeholder="Ej: 50"
              className={inputClass}
              min="1"
              max="500"
            />
          </Field>

          <Field label="Tipos de conector">
            <div className="flex flex-wrap gap-2 mt-1">
              {CONNECTORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleConnector(c)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                    form.connectorTypes.includes(c)
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-green-400"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Comentario adicional">
            <textarea
              value={form.comment}
              onChange={(e) => set("comment", e.target.value)}
              placeholder="Horarios, acceso, costo, etc."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </Field>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {sending ? "Enviando..." : "Enviar estación"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
