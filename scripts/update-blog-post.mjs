import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envContent = readFileSync(join(__dirname, "../.env.local"), "utf8");
for (const line of envContent.split("\n")) {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) process.env[key.trim()] = rest.join("=").trim().replace(/^"|"$/g, "");
}

const sql = neon(process.env.DATABASE_URL);
const slug = "viaje-auto-electrico-costa-atlantica-argentina";

const content = `En 2026, las ventas de autos eléctricos en Argentina [se cuadruplicaron en el primer trimestre](https://www.infobae.com/economia/2026/04/24/los-autos-hibridos-y-electricos-cuadruplicaron-sus-ventas-en-lo-que-va-de-2026-y-tienen-un-nuevo-lider/) y cada vez más propietarios se hacen la misma pregunta: ¿puedo hacer la **ruta Buenos Aires – Mar del Plata en auto eléctrico** sin quedarme tirado en la autopista?

La respuesta corta es **sí**, pero hay que planificarlo bien. YPF instaló [más de 20 puntos de carga](https://energiaonline.com.ar/ypf-instalo-mas-de-20-puntos-de-carga-electrica-ya-se-puede-ir-de-buenos-aires-a-mar-del-plata/) a lo largo del corredor de Ruta 2, con cargadores ultra-rápidos de hasta 160 kW en puntos estratégicos del camino. El truco está en saber dónde están, cuánto vas a esperar y cómo coordinar tu autonomía con las paradas disponibles.

Esta guía te lleva paso a paso, con datos reales del corredor y sin adornos.

> **Key Takeaways**
>
> - En 2026 hay [más de 260 puntos de carga pública](https://www.lanacion.com.ar/autos/mapa-de-cargadores-donde-se-puede-cargar-un-auto-electrico-en-marzo-2026-en-el-pais-nid10032026/) en Argentina, con cobertura en todo el corredor Ruta 2 Buenos Aires – Mar del Plata
> - Los cargadores de hasta 160 kW en Chascomús (km 113) y Dolores (km 202) cargan hasta el 80% en menos de 45 minutos
> - El costo por kilómetro de un auto eléctrico es entre un 40% y un 60% menor al de un auto a nafta
> - El [planificador de rutas de DóndeCargar](https://dondecargar.com.ar/ruta) muestra los cargadores actualizados en tiempo real para el corredor completo

---

## ¿Cuánto mide la ruta Buenos Aires – Mar del Plata?

Antes de arrancar, hay que tener claras las distancias. El corredor atlántico tiene dos opciones principales:

| Ruta | Distancia | Qué pasás |
|---|---|---|
| Ruta 2 (Autopista del Atlántico) | ~400 km | La más directa. Chascomús y Dolores como puntos de carga |
| Ruta 11 (por la costa) | ~450–490 km | Pinamar, Villa Gesell, Miramar antes de llegar |

Para un primer viaje en eléctrico, **la Ruta 2 es la opción más segura**. Concentra la mayor cantidad de puntos de carga rápida del corredor atlántico. La Ruta 11 está en expansión, pero todavía tiene tramos con baja densidad de cargadores.

---

## ¿Qué autonomía real necesitás?

El primer error que comete la mayoría es confiar en la autonomía del manual. En autopista, a 110–120 km/h con el clima encendido, el consumo sube entre un 15% y un 25% respecto a la estimación WLTP del fabricante.

| Modelo | Batería | Autonomía real estimada en ruta |
|---|---|---|
| BYD Seal | 82 kWh | ~360–400 km |
| BYD Atto 3 | 60 kWh | ~260–290 km |
| BYD Dolphin | 44 kWh | ~190–220 km |
| Volkswagen ID.4 | 77 kWh | ~330–360 km |
| Chery Tiggo 8 EV | 68 kWh | ~280–310 km |
| JAC E10X | 38 kWh | ~160–180 km |

> **Regla práctica:** restale un 15–20% a la autonomía WLTP para estimar tu alcance real en autopista. Y nunca planifiques llegar con menos del 10% de batería restante: es tu margen de seguridad ante lo inesperado.

---

## Los cargadores en el corredor Ruta 2

Este es el dato clave antes de salir. El corredor Buenos Aires – Dolores – Mar del Plata tiene cobertura gracias a YPF, Shell, ChargeBox y operadores privados.

![Foto: cargadores eléctricos en ruta — podés agregar una imagen acá desde el editor](REEMPLAZAR-CON-URL-DE-FOTO)

### La Plata / salida de Buenos Aires

Al salir del área metropolitana, hay puntos de carga YPF sobre la autopista en dirección a La Plata. Son los primeros del corredor, útiles si salís con la batería debajo del 80%.

### Chascomús — km 113

El primer punto estratégico de la ruta. Hay dos operadores:

- **Shell Recharge:** cargador de hasta [160 kW](https://www.sirchandler.com.ar/2023/11/los-enchufes-de-la-ruta-2-para-unir-con-auto-electrico-mar-del-plata-con-buenos-aires-andan/), uno de los más potentes del corredor. Requiere la app Shell Recharge para activarlo
- **ChargeBox (parador de la autopista):** carga más lenta, requiere suscripción mensual

**¿Cuándo conviene parar acá?** Si tu auto tiene menos de 250 km de autonomía real, esta parada es casi obligatoria. Con más de 300 km podés estirar hasta Dolores.

### Dolores — km 202 (el punto estrella)

Dolores es el corazón de la infraestructura de carga de Ruta 2. La [estación YPF en el kilómetro 202](https://energiaonline.com.ar/ypf-instalo-mas-de-20-puntos-de-carga-electrica-ya-se-puede-ir-de-buenos-aires-a-mar-del-plata/) es la más equipada del corredor:

- Cargadores rápidos de **50 kW** (CCS2 y CHAdeMO disponibles)
- Cargadores ultra-rápidos de hasta **160 kW**
- **Tres posiciones** de carga simultánea
- Carga del 20% al 80% en menos de 45 minutos

El Hotel Howard Johnson de Dolores tiene cargadores ChargeBox (2 posiciones), que funcionan como respaldo si el YPF está ocupado o si hacés una parada de almuerzo más larga.

Dolores está prácticamente equidistante entre Buenos Aires y Mar del Plata. Si tu auto tiene 250 km o más de autonomía real, **una sola parada acá alcanza para el viaje completo**.

### Mar del Plata (destino)

Al llegar, Mar del Plata tiene varios puntos de carga disponibles:

- ChargeBox en el Carrefour (accesible, con estacionamiento)
- Hoteles de la zona costera con carga para huéspedes
- Múltiples puntos privados en crecimiento

Buscá "Mar del Plata" en [dondecargar.com.ar](https://dondecargar.com.ar) para ver la lista completa actualizada con tipo de conector y disponibilidad.

> Para ver el mapa completo del corredor en tiempo real, usá el [planificador de rutas de DóndeCargar](https://dondecargar.com.ar/ruta).

---

## Tiempos de carga: ¿cuánto vas a esperar?

La duración de la parada depende del tipo de cargador y de tu modelo de auto:

| Tipo de cargador | Potencia | Tiempo para sumar ~100 km de autonomía |
|---|---|---|
| DC ultra-rápido | 160 kW | ~8–12 minutos |
| DC rápido | 50 kW | ~20–25 minutos |
| AC estándar (Tipo 2) | 22 kW | ~40–60 minutos |
| Cargador doméstico (220V) | 3,7 kW | 3–4 horas |

La estrategia más eficiente para el viaje largo: **cargá hasta el 80% en un cargador DC rápido y seguí**. Por encima del 80%, la batería carga más lento para proteger las celdas; esperar del 80% al 100% puede demorar más que cargar del 10% al 80%.

En Dolores, con el cargador YPF de hasta 160 kW, podés sumar 200 km de autonomía en 20–25 minutos —el tiempo justo para tomar un café y comer algo.

---

## Comparativa de costos: auto eléctrico vs nafta

Para el trayecto completo Buenos Aires – Mar del Plata (~400 km), la diferencia es importante:

**Auto a nafta (nafta super, consumo 10–12 L/100km):**

- Consumo estimado: 40–48 litros para el viaje completo
- El costo depende del precio vigente de la nafta al momento del viaje

**Auto eléctrico (carga pública DC en el corredor):**

- Consumo estimado: 60–80 kWh para el viaje completo
- Pagás principalmente la parada en Dolores o Chascomús; el resto arranca con carga de casa

**Auto eléctrico (con carga doméstica previa):**

- Si salís con la batería llena desde casa a tarifa residencial, el costo inicial es mínimo
- Solo pagás carga pública para la parada intermedia y para recargar en Mar del Plata

En la práctica, el costo por kilómetro de un auto eléctrico en Argentina **es entre un 40% y un 60% menor** que el de un auto a nafta equivalente cuando combinás carga doméstica con una parada de carga rápida en ruta.

---

## Paso a paso: cómo planificar el viaje

### Paso 1: Calculá la autonomía real de tu auto

No te quedes con el número del manual. En foros argentinos de BYD, Volkswagen y Chery hay datos reales de propietarios que hicieron Ruta 2 en invierno y en verano. El consumo varía: el aire acondicionado puede reducir la autonomía un 10–15% adicional.

Encendé el auto, activá el clima como lo llevarías en el viaje, y revisá la estimación del computador de a bordo. Ese número, descontado un 10%, es tu margen real.

### Paso 2: Abrí el planificador de DóndeCargar

Antes de salir, entrá a **[dondecargar.com.ar/ruta](https://dondecargar.com.ar/ruta)**, ingresá tu origen y destino, y revisá todos los cargadores disponibles en el corredor, distancias, tipos de conector, y si hay algún tramo sin cobertura para tu autonomía.

Si hacés la ruta costera por Ruta 11, ingresá Pinamar o Villa Gesell como waypoint intermedio para verificar la cobertura en ese tramo.

### Paso 3: Elegí cuántas paradas hacer

| Autonomía real de tu auto | Estrategia recomendada |
|---|---|
| Más de 380 km | Directo a Mar del Plata, cargás allá |
| 280–380 km | Una parada en Dolores (km 202) |
| 200–280 km | Parada en Chascomús y/o Dolores |
| Menos de 200 km | Dos paradas: Chascomús + Dolores |

### Paso 4: Verificá el conector de tu auto

Los conectores disponibles en el corredor Ruta 2 en 2026:

- **CCS2 (Combo 2):** estándar europeo y chino moderno — VW ID.4, Chery, JAC, BYD Seal
- **CHAdeMO:** algunos modelos asiáticos más antiguos como el Nissan Leaf
- **Tipo 2 (AC):** carga más lenta pero ampliamente disponible
- **NACS / Tesla:** requiere adaptador en la mayoría de los puntos

Antes de salir, verificá en la ficha de cada cargador en [DóndeCargar](https://dondecargar.com.ar) que el conector es compatible con tu auto.

### Paso 5: Salí con la batería al máximo

La noche anterior al viaje, cargá tu auto al 100% en casa. La carga doméstica es la más barata y te da el margen máximo para llegar cómodo al primer punto de la ruta sin ansiedad.

Si tu auto tiene gestión térmica de la batería, activá el preacondicionamiento 20–30 minutos antes de cargar en un cargador DC rápido — las baterías frías no aceptan la máxima potencia.

### Paso 6: Tené un plan B para los cargadores

Las fallas existen. Si el cargador que planificaste está fuera de servicio:

- El planificador de [DóndeCargar](https://dondecargar.com.ar/ruta) muestra alternativas cercanas en el corredor
- En Dolores, los cargadores del Hotel Howard Johnson son el respaldo del YPF
- Llevá el cable del fabricante (Schuko o CEE 7/4) para conectarte a un tomacorriente común en caso de emergencia

---

## Errores comunes al hacer Ruta 2 en eléctrico

**No calcular el consumo real en autopista.** Es el más frecuente. La diferencia entre la autonomía WLTP y la real en ruta puede ser de hasta 80–100 km en algunos modelos.

**Salir sin el cable del fabricante.** Si el cargador DC está ocupado o fuera de servicio, un tomacorriente doméstico puede ser la diferencia entre continuar y esperar dos horas.

**No verificar los conectores disponibles.** Llegás a Dolores con CHAdeMO y el cargador disponible es solo CCS2. Revisá antes de salir.

**Esperar al 100% en la parada.** Cargá hasta el 80% y seguí. Ahorrarás 20–30 minutos sin impacto real en el viaje.

---

## Planificá tu ruta con DóndeCargar

La herramienta más actualizada para hacer este viaje con tranquilidad es el planificador de rutas de DóndeCargar. Ingresás origen y destino, y en segundos ves todos los cargadores del corredor con sus distancias, tipos de conector, y una alerta si detecta un tramo donde tu autonomía podría no alcanzar.

No salgas a la Autopista del Atlántico sin revisarlo primero.

[→ Planificá tu viaje eléctrico a Mar del Plata en dondecargar.com.ar/ruta](https://dondecargar.com.ar/ruta)

---

## Preguntas frecuentes

### ¿Se puede hacer Buenos Aires – Mar del Plata en auto eléctrico sin quedarme sin batería?

Sí. El corredor Ruta 2 tiene cobertura de carga con puntos en Chascomús (km 113) y Dolores (km 202), operados por Shell, YPF y ChargeBox. La mayoría de los autos eléctricos disponibles en Argentina en 2026 tienen autonomía suficiente para hacer el viaje con una sola parada planificada. Usá el [planificador de DóndeCargar](https://dondecargar.com.ar/ruta) para verificar con tu modelo específico.

### ¿Cuánto tarda cargar el auto eléctrico en la Ruta 2?

En los cargadores de hasta 160 kW disponibles en Chascomús y Dolores, podés cargar del 20% al 80% en 20 a 40 minutos dependiendo del modelo y la temperatura de la batería. En los cargadores de 50 kW (YPF Dolores), el mismo proceso toma entre 40 y 60 minutos.

### ¿Cuáles son los mejores autos eléctricos para hacer el viaje a Mar del Plata?

El [BYD Seal](https://dondecargar.com.ar) (82 kWh, ~360–400 km de autonomía real en ruta) y el Volkswagen ID.4 (77 kWh, ~330–360 km) son los más cómodos: pueden llegar con una sola parada o directamente sin paradas. El BYD Atto 3, Chery Tiggo 8 EV y BYD Dolphin también hacen el viaje perfectamente con una parada bien planificada.

### ¿Hay cargadores en Mar del Plata?

Sí. Mar del Plata tiene varios puntos de carga disponibles, incluyendo el ChargeBox del Carrefour y puntos en hoteles de la zona costera. Buscá "Mar del Plata" en [dondecargar.com.ar](https://dondecargar.com.ar) para ver la lista completa actualizada.

### ¿Qué pasa si el cargador de Dolores está ocupado o roto?

Los cargadores YPF de Dolores tienen tres posiciones simultáneas, lo que reduce las esperas. Si igual está todo ocupado, el Hotel Howard Johnson de Dolores tiene cargadores ChargeBox disponibles como alternativa. Revisá el [planificador de DóndeCargar](https://dondecargar.com.ar/ruta) antes de salir para tener un plan B identificado.

---

## Fuentes

- [Energía Online — "YPF instaló más de 20 puntos de carga eléctrica: ya se puede ir de Buenos Aires a Mar del Plata"](https://energiaonline.com.ar/ypf-instalo-mas-de-20-puntos-de-carga-electrica-ya-se-puede-ir-de-buenos-aires-a-mar-del-plata/), recuperado mayo 2026
- [La Nación — "Mapa de cargadores: dónde se puede cargar un auto eléctrico en marzo 2026 en el país"](https://www.lanacion.com.ar/autos/mapa-de-cargadores-donde-se-puede-cargar-un-auto-electrico-en-marzo-2026-en-el-pais-nid10032026/), marzo 2026
- [Infobae — "Los autos híbridos y eléctricos cuadruplicaron sus ventas en lo que va de 2026 y tienen un nuevo líder"](https://www.infobae.com/economia/2026/04/24/los-autos-hibridos-y-electricos-cuadruplicaron-sus-ventas-en-lo-que-va-de-2026-y-tienen-un-nuevo-lider/), abril 2026
- [Sir Chandler — "Los enchufes de la ruta 2 para unir con auto eléctrico Mar del Plata con Buenos Aires ¿Andan?"](https://www.sirchandler.com.ar/2023/11/los-enchufes-de-la-ruta-2-para-unir-con-auto-electrico-mar-del-plata-con-buenos-aires-andan/), noviembre 2023`;

async function run() {
  const rows = await sql`
    UPDATE "BlogPost"
    SET content = ${content}, "updatedAt" = NOW()
    WHERE slug = ${slug}
    RETURNING id, slug
  `;
  if (!rows.length) {
    console.error("❌ No se encontró el post con slug:", slug);
    process.exit(1);
  }
  console.log("✅ Post actualizado:", rows[0]);
}

run().catch(console.error);
