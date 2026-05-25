import { Suspense } from "react";
import RutaClient from "./RutaClient";

export const metadata = {
  title: "Planificador de viaje eléctrico – DóndeCargar",
  description:
    "Planificá tu viaje con tu auto eléctrico en Argentina. Calculá cargadores en tu ruta, conocé los gaps de autonomía y encontrá estaciones DC y AC en el camino.",
};

export default function RutaPage() {
  return (
    <Suspense>
      <RutaClient />
    </Suspense>
  );
}
