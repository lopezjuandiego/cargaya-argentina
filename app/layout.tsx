import type { Metadata } from "next";
import "./globals.css";
import FeedbackButton from "./FeedbackButton";
import { Analytics } from "@vercel/analytics/next";

const BASE_URL = "https://dondecargar.com.ar";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "DóndeCargar – Cargadores eléctricos en Argentina",
    template: "%s | DóndeCargar",
  },
  description:
    "Encontrá la estación de carga eléctrica más cercana en Argentina. Más de 230 cargadores: YPF, Chargebox, Scame y más. Buscá por ciudad o planificá tu ruta.",
  keywords: [
    "cargadores eléctricos Argentina",
    "estaciones de carga EV",
    "autos eléctricos Argentina",
    "dónde cargar auto eléctrico",
    "mapa cargadores Argentina",
  ],
  openGraph: {
    siteName: "DóndeCargar",
    locale: "es_AR",
    type: "website",
    title: "DóndeCargar – Cargadores eléctricos en Argentina",
    description:
      "Más de 230 estaciones de carga para autos eléctricos en todo el país. Buscá por ubicación o planificá tu ruta.",
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
        <FeedbackButton />
        <Analytics />
      </body>
    </html>
  );
}
