"use client";

import { useRouter } from "next/navigation";

const RADIOS = [1, 3, 5, 10];

export default function RadioSelector({
  current,
  lat,
  lng,
  q,
}: {
  current: number;
  lat?: string;
  lng?: string;
  q?: string;
}) {
  const router = useRouter();

  function navigate(r: number) {
    const p = new URLSearchParams();
    if (lat && lng) { p.set("lat", lat); p.set("lng", lng); }
    else if (q) p.set("q", q);
    p.set("radio", String(r));
    router.push(`/buscar?${p.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
      <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">Radio:</span>
      {RADIOS.map((r) => (
        <button
          key={r}
          onClick={() => navigate(r)}
          className={`flex-shrink-0 text-sm px-3 py-1.5 rounded-full border transition-colors ${
            current === r
              ? "bg-green-600 text-white border-green-600 font-semibold"
              : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
          }`}
        >
          {r} km
        </button>
      ))}
    </div>
  );
}
