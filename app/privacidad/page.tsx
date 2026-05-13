import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad de CargaYa — cómo recopilamos y usamos tu información.",
  robots: "noindex",
};

export default function PrivacidadPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <a href="/" className="text-sm text-green-600 hover:underline">← Volver al inicio</a>
      <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">Política de Privacidad</h1>
      <p className="text-sm text-gray-400 mb-8">Última actualización: mayo de 2026</p>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">1. ¿Qué es CargaYa?</h2>
          <p>
            CargaYa (<strong>cargaya-argentina.vercel.app</strong>) es un directorio comunitario de
            estaciones de carga para vehículos eléctricos en Argentina. No requerimos registro ni
            creación de cuenta para utilizar el servicio.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Información que recopilamos</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Reportes de estado:</strong> cuando reportás si una estación funciona o no,
              almacenamos tu dirección IP para prevenir abusos. No asociamos esta IP a ningún dato
              personal identificable.
            </li>
            <li>
              <strong>Envíos de estaciones:</strong> si agregás una estación nueva, guardamos los
              datos del formulario (nombre, dirección, conectores, etc.) sin requerir datos personales.
            </li>
            <li>
              <strong>Datos de uso anónimos:</strong> podemos registrar métricas de uso agregadas
              (páginas visitadas, búsquedas frecuentes) sin identificar usuarios individuales.
            </li>
          </ul>
          <p className="mt-2">
            <strong>No recopilamos</strong> nombre, email, teléfono ni ningún otro dato personal
            identificable, salvo que lo suministres voluntariamente en el comentario de un envío.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Cómo usamos la información</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Mejorar la precisión del directorio de estaciones.</li>
            <li>Detectar y prevenir reportes de estado abusivos o spam.</li>
            <li>Analizar el uso general del sitio para mejorar la experiencia.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Servicios de terceros</h2>
          <p>CargaYa utiliza los siguientes servicios externos:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Nominatim / OpenStreetMap</strong> — geocodificación de ciudades y barrios.
              Política:{" "}
              <a href="https://osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                osmfoundation.org
              </a>
            </li>
            <li>
              <strong>OSRM (Project OSRM)</strong> — cálculo de rutas en vehículo.
            </li>
            <li>
              <strong>Google Maps</strong> — enlace de navegación desde la página de cada estación.
              Política:{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                policies.google.com
              </a>
            </li>
            <li>
              <strong>Google AdSense</strong> — podemos mostrar publicidad de Google AdSense, que
              puede usar cookies para mostrar anuncios relevantes según tu historial de navegación.
              Podés optar por no participar en la personalización de anuncios en{" "}
              <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                adssettings.google.com
              </a>.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Cookies</h2>
          <p>
            CargaYa no utiliza cookies propias. Los servicios de terceros (especialmente Google
            AdSense) pueden establecer cookies en tu navegador. Podés gestionar las cookies desde
            la configuración de tu navegador.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Almacenamiento de datos</h2>
          <p>
            Los datos se almacenan en servidores de Neon (PostgreSQL serverless) ubicados en
            Estados Unidos, bajo las condiciones de privacidad de Neon Inc.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Tus derechos</h2>
          <p>
            Si enviaste una estación y querés solicitar su eliminación o corrección, contactanos en{" "}
            <strong>contacto@cargaya.com.ar</strong>. Dado que no almacenamos datos personales
            identificables, no es posible asociar un reporte de estado a una persona específica.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Cambios a esta política</h2>
          <p>
            Podemos actualizar esta política en cualquier momento. Los cambios se publicarán en esta
            misma página con la fecha de actualización.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Contacto</h2>
          <p>
            Para consultas sobre privacidad: <strong>contacto@cargaya.com.ar</strong>
          </p>
        </section>
      </div>
    </div>
  );
}
