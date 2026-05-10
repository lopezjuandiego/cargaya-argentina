import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CargaYa - Estaciones de carga eléctrica en Argentina",
  description:
    "Encontrá la estación de carga eléctrica más cercana. Red de cargadores para autos eléctricos en Argentina: CABA, Buenos Aires y todo el país.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
