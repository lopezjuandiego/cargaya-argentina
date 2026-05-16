import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts: propio + GA4 + Vercel Analytics
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com",
      // Estilos: propio + inline (Leaflet, Tailwind)
      "style-src 'self' 'unsafe-inline'",
      // Imágenes: propio + OSM tiles + cualquier https (fotos del blog)
      "img-src 'self' data: https:",
      // Fuentes
      "font-src 'self'",
      // Fetch/XHR: propio + APIs externas
      "connect-src 'self' https://nominatim.openstreetmap.org https://router.project-osrm.org https://www.google-analytics.com https://vitals.vercel-insights.com",
      // Iframes: bloqueados
      "frame-src 'none'",
      // Objetos: bloqueados
      "object-src 'none'",
      // Base URI: solo propio
      "base-uri 'self'",
      // Form action: solo propio
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
