import { Suspense } from "react";
import RutaClient from "./RutaClient";

export const metadata = {
  title: "Planificá tu ruta – CargaYa",
  description:
    "Encontrá estaciones de carga eléctrica en tu camino entre dos puntos de Argentina.",
};

export default function RutaPage() {
  return (
    <Suspense>
      <RutaClient />
    </Suspense>
  );
}
