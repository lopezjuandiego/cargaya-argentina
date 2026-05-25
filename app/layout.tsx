import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import FeedbackButton from "./FeedbackButton";
import { Analytics } from "@vercel/analytics/next";

const BASE_URL = "https://dondecargar.com.ar";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "DóndeCargar – Cargadores eléctricos en Argentina y Uruguay",
    template: "%s | DóndeCargar",
  },
  description:
    "Encontrá la estación de carga eléctrica más cercana en Argentina y Uruguay. Más de 240 cargadores: YPF, Chargebox, Scame y más. Buscá por ciudad o planificá tu ruta.",
  keywords: [
    "cargadores eléctricos Argentina",
    "cargadores eléctricos Uruguay",
    "estaciones de carga EV",
    "autos eléctricos Argentina",
    "dónde cargar auto eléctrico",
    "mapa cargadores Argentina",
    "cargadores Montevideo",
    "planificador viaje eléctrico",
  ],
  openGraph: {
    siteName: "DóndeCargar",
    locale: "es_AR",
    type: "website",
    title: "DóndeCargar – Cargadores eléctricos en Argentina y Uruguay",
    description:
      "Más de 240 estaciones de carga para autos eléctricos en Argentina y Uruguay. Buscá por ubicación o planificá tu ruta.",
    url: BASE_URL,
  },
  twitter: { card: "summary" },
  alternates: { canonical: BASE_URL },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        {children}
        <footer className="mt-auto px-4 py-6 text-center text-xs text-gray-400 border-t border-gray-100">
          La información sobre estaciones de carga es provista por usuarios y fuentes públicas (OpenStreetMap, Open Charge Map).
          DóndeCargar no garantiza que los datos estén actualizados ni que las estaciones estén operativas al momento de tu visita.
          Verificá siempre con la app del operador antes de salir.
        </footer>
        <FeedbackButton />
        <Analytics />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-BQKYW391F3"
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-BQKYW391F3');`}
        </Script>
      </body>
    </html>
  );
}
