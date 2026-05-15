import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos de Uso",
  description: "Términos y condiciones de uso de CargaYa.",
  robots: "noindex",
};

export default function TerminosPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <a href="/" className="text-sm text-green-600 hover:underline">← Volver al inicio</a>
      <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">Términos de Uso</h1>
      <p className="text-sm text-gray-400 mb-8">Última actualización: mayo de 2026</p>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Aceptación de los términos</h2>
          <p>
            Al acceder y utilizar CargaYa (<strong>cargaya-argentina.vercel.app</strong>), aceptás
            estos Términos de Uso. Si no estás de acuerdo, no uses el servicio.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Descripción del servicio</h2>
          <p>
            CargaYa es un directorio comunitario de estaciones de carga para vehículos eléctricos
            en Argentina. La información proviene de fuentes públicas (Open Charge Map, redes de
            operadores) y aportes de la comunidad. El servicio es gratuito y de acceso libre.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Exactitud de la información</h2>
          <p>
            CargaYa <strong>no garantiza</strong> la exactitud, completitud ni disponibilidad de la
            información sobre las estaciones. Los datos pueden estar desactualizados. Siempre
            verificá el estado de una estación antes de planificar un viaje largo que dependa de
            ella. CargaYa no se responsabiliza por daños derivados del uso de información
            incorrecta o desactualizada.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Contenido generado por usuarios</h2>
          <p>
            Al reportar el estado de una estación o enviar una nueva, aceptás que:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>La información que proporcionás es correcta y de buena fe.</li>
            <li>Cedés a CargaYa el derecho de publicar y modificar dicha información.</li>
            <li>No enviás contenido falso, spam o con intención de dañar el servicio.</li>
          </ul>
          <p className="mt-2">
            CargaYa se reserva el derecho de eliminar contenido inapropiado o incorrecto sin previo aviso.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Uso aceptable</h2>
          <p>Queda prohibido:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Enviar información falsa o maliciosa sobre estaciones.</li>
            <li>Realizar scraping masivo o automatizado sin autorización.</li>
            <li>Interferir con el funcionamiento del servicio.</li>
            <li>Usar el servicio para fines ilegales.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Propiedad intelectual</h2>
          <p>
            El código, diseño y contenido editorial de CargaYa son propiedad de sus creadores.
            Los datos de estaciones provenientes de Open Charge Map están sujetos a la licencia
            Creative Commons de ese proyecto. Los datos aportados por la comunidad se comparten
            bajo licencia abierta.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Limitación de responsabilidad</h2>
          <p>
            CargaYa se provee "tal cual es" sin garantías de ningún tipo. En ningún caso CargaYa
            será responsable por daños directos, indirectos, incidentales o consecuentes derivados
            del uso o imposibilidad de uso del servicio.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Modificaciones</h2>
          <p>
            Podemos modificar estos términos en cualquier momento. El uso continuado del servicio
            después de los cambios implica aceptación de los nuevos términos.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Ley aplicable</h2>
          <p>
            Estos términos se rigen por las leyes de la República Argentina. Cualquier disputa se
            resolverá ante los tribunales competentes de la Ciudad Autónoma de Buenos Aires.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Contacto</h2>
          <p>
            Para consultas: <strong>lopezjuandiego@gmail.com</strong>
          </p>
        </section>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4 text-sm text-gray-400">
        <a href="/privacidad" className="hover:text-green-600">Política de Privacidad</a>
        <a href="/" className="hover:text-green-600">Inicio</a>
      </div>
    </div>
  );
}
