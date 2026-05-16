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

const title = "Ansiedad de autonomía en autos eléctricos: qué es, por qué la sentís y cómo superarla";
const slug = "ansiedad-autonomia-range-anxiety-auto-electrico-argentina";
const excerpt = "El 76% de quienes consideran comprar un auto eléctrico teme quedarse sin batería en el camino. Te explicamos por qué esa ansiedad de autonomía es en gran parte un mito — y cómo superarla con datos reales del mercado argentino.";
const published = true;

const content = `Tenés el auto eléctrico en el radar. Mirás los precios, comparás modelos, calculás el ahorro en nafta... y entonces aparece ese pensamiento: *¿y si me quedo sin batería en la autopista?*

Eso tiene nombre: **range anxiety** o ansiedad de autonomía. Y [el 76% de las personas que consideran comprar un eléctrico la sienten](https://solartechonline.com/blog/ev-range-anxiety-complete-guide-2025/) antes de dar el paso. Es el freno número uno para la adopción de autos eléctricos en todo el mundo, incluida Argentina.

Pero acá está el dato que cambia todo: una vez que tienen el auto, [solo el 1-2% de los dueños reales experimenta alguna vez un problema relacionado con la autonomía](https://www.electriccarscheme.com/blog/range-anxiety-is-it-real). La ansiedad desaparece en el primer mes de uso, en promedio.

Esta guía te explica por qué la range anxiety es casi siempre infundada, cómo funciona en el contexto argentino, y qué herramientas concretas tenés para planificar sin miedo.

> **Key Takeaways**
>
> - El 76% de compradores potenciales teme quedarse sin batería — pero solo el 1-2% de dueños reales experimenta ese problema ([Electric Car Scheme](https://www.electriccarscheme.com/blog/range-anxiety-is-it-real), 2026)
> - Un argentino maneja en promedio unos 33 km por día — cualquier auto eléctrico disponible en Argentina cubre ese uso con días de margen
> - La ansiedad real de 2026 no es "quedarme sin batería": es encontrar cargadores ocupados o fuera de servicio en viajes largos
> - El [planificador de rutas de DóndeCargar](https://dondecargar.com.ar/ruta) resuelve esa segunda ansiedad: te muestra los cargadores en el corredor antes de salir

---

## ¿Qué es exactamente la range anxiety?

La ansiedad de autonomía es el miedo a que la batería del auto eléctrico se agote antes de llegar al destino o al próximo punto de carga. El término viene del inglés *range anxiety* y es tan conocido en la industria automotriz que fabricantes como Tesla, BMW y BYD diseñan sus interfaces de usuario específicamente para reducirla.

No es un miedo irracional per se — tiene raíz real. En los primeros autos eléctricos del mercado (el Nissan Leaf original tenía ~120 km de autonomía real), quedarse sin carga era un riesgo genuino. Pero los autos de 2026 son radicalmente distintos.

---

## El problema con la ansiedad: nuestro cerebro sobreestima el riesgo

La psicología tiene una explicación clara. Tendemos a sobrestimar riesgos poco frecuentes pero dramáticos (quedarnos varados en la ruta) y subestimar los habituales y silenciosos (pagar $100 en nafta cada semana sin pensar).

El resultado: imaginamos el peor escenario posible — viaje nocturno, lluvia, batería al 3%, sin señal — y lo usamos como referencia para evaluar el auto eléctrico. Pero ese escenario aplica igual al auto a nafta con el tanque vacío.

[Un estudio de la AAA (American Automobile Association)](https://ampereev.com/is-range-anxiety-still-a-barrier-for-ev-adoption/) lo confirma: **la mejor cura para la range anxiety es simplemente tener el auto**. La experiencia reemplaza el miedo con confianza en 30 a 60 días.

---

## Los números reales del uso diario en Argentina

Antes de hablar de autonomía, hablemos de cuánto manejás realmente.

Un auto en Argentina recorre en promedio entre 12.000 y 15.000 km por año. Dividido en 365 días, eso da **entre 33 y 41 km diarios**. Si trabajás en la ciudad y usás el auto para ir y volver, probablemente manejás menos.

Ahora mirá lo que ofrecen los autos eléctricos disponibles en Argentina en 2026:

| Modelo | Autonomía real estimada | Días de uso promedio (33 km/día) |
|---|---|---|
| BYD Dolphin Mini | ~190–210 km | **6 días** |
| BYD Dolphin | ~260–290 km | **8 días** |
| BYD Atto 3 | ~260–290 km | **8 días** |
| Chery Tiggo 8 EV | ~280–310 km | **9 días** |
| BYD Seal | ~360–400 km | **11 días** |
| Volkswagen ID.4 | ~330–360 km | **10 días** |

El auto más básico del mercado argentino actual te lleva **6 días** de manejo normal antes de necesitar carga. Y con carga nocturna en casa (enchufás el auto cuando llegás, como el celular), arrancás cada mañana con el depósito "lleno".

---

## Cómo funciona la carga cotidiana en la práctica

El cambio mental más importante al pasarse al eléctrico es este: **ya no vas a cargar el auto** como cargás nafta. El auto se carga solo, de noche, en tu garaje o estacionamiento.

El proceso típico:
1. Llegás a casa con el 30–40% de batería
2. Enchufás el cable (el mismo que viene con el auto, al tomacorriente doméstico)
3. A la mañana siguiente: 100%

Un cargador doméstico estándar (220V / 16A) agrega unos 10–12 km de autonomía por hora. En 6–8 horas de sueño, recargás 60–100 km. Más que suficiente para el uso diario.

> Si querés carga más rápida en casa, un Wallbox (cargador AC de 7 kW) recarga 40–50 km por hora. La instalación en Argentina ronda los USD 400–800 según el electricista y el modelo.

---

## La ansiedad real de 2026: cargadores, no batería

Hay una evolución interesante que los estudios recientes detectaron: a medida que las autonomías crecieron y la infraestructura se expandió, la *range anxiety* tradicional cedió lugar a algo nuevo: la **charge anxiety**.

No es miedo a quedarse sin batería. Es miedo a llegar al cargador y encontrarlo:
- Ocupado con cola de espera
- Fuera de servicio
- Incompatible con tu conector
- Sin señal para pagar

Esta es la ansiedad real de 2026, especialmente para viajes largos como Buenos Aires–Mar del Plata o Buenos Aires–Córdoba. Y es legítima, porque pasa.

**La solución es planificación previa**, no evitar el eléctrico:

1. Revisá los cargadores del corredor antes de salir en [dondecargar.com.ar/ruta](https://dondecargar.com.ar/ruta)
2. Identificá siempre un cargador de respaldo a no más de 20 km del principal
3. Salí con la batería al 100%
4. Cargá en el camino al 80% (no esperes el 100% — tarda el doble de tiempo)

---

## Paso a paso: cómo eliminar la range anxiety antes de comprar

### Paso 1: Calculá tu uso real, no el imaginario

Anotá durante una semana cuántos kilómetros manejás por día. No el día que fuiste al interior — el día típico. En la mayoría de los casos vas a encontrar que manejás entre 20 y 60 km diarios.

Con ese número en mano, compará con la tabla de autonomías de arriba. En casi todos los casos, cualquier auto eléctrico disponible en Argentina te cubre holgadamente.

### Paso 2: Separaá el uso cotidiano del uso excepcional

El auto eléctrico es ideal para el 95% de tu manejo: la ciudad, los mandados, el trabajo. Para el 5% restante (el viaje largo de vacaciones), hay dos opciones:
- **Planificás la ruta** con el planificador de DóndeCargar y hacés una parada de 20 minutos en el camino
- **Alquilás un auto a nafta** para ese viaje puntual — sale mucho más barato que perder el ahorro anual en nafta

### Paso 3: Aprendé dónde están los cargadores en tu zona

Entrá a [dondecargar.com.ar](https://dondecargar.com.ar), buscá tu barrio o ciudad, y fijate cuántos cargadores públicos hay cerca. En Buenos Aires, hay puntos de carga en Palermo, Caballito, San Telmo, Belgrano y más. En ciudades como Rosario, Córdoba y Mar del Plata la cobertura también creció significativamente en 2025–2026.

Saber que existen — aunque no los uses todos los días — reduce la ansiedad de forma inmediata.

### Paso 4: Entendé cómo leer la autonomía de tu auto

Todos los autos muestran en el tablero una estimación de kilómetros restantes. Esa estimación **se adapta en tiempo real** al estilo de manejo y las condiciones:
- Si manejás a 60 km/h en ciudad: el estimado sube
- Si manejás a 120 km/h en autopista con aire acondicionado: el estimado baja

No entres en pánico si el número baja más rápido de lo esperado en autopista — es normal. Lo mismo pasa con el consumo de nafta a alta velocidad, pero nadie lo nota porque miramos el tanque lleno sin pensar.

### Paso 5: Hacé el primer viaje largo con margen

Antes de que la confianza sea total, planificá tu primer viaje largo con margen generoso. Salí con el 100%, programá una parada en el cargador más cómodo (no el más justo) y llegá con más del 20% restante. Ese primer viaje exitoso hace más que cualquier estadística para eliminar la ansiedad.

---

## Errores comunes que alimentan la range anxiety

**Comparar la autonomía WLTP con la autonomía real.** El número del folleto es bajo condiciones de laboratorio. En autopista a 120 km/h, descountale un 20–25%. Si el auto dice 350 km WLTP, planificá con 280 km.

**Pensar en el auto eléctrico como un auto a nafta.** La nafta se carga en 5 minutos en la estación de servicio. La electricidad se carga en casa, de noche. Son dos lógicas distintas. El eléctrico no te "queda sin combustible" — vos decidís no cargarlo la noche anterior.

**Sumar todos los "peores días" posibles.** "¿Y si hace frío y la batería rinde menos, y encima vengo de un viaje largo, y el cargador más cercano está roto?" Ese escenario existe — igual que quedarse sin nafta en el kilómetro 400 de una ruta sin estaciones. Planificación básica lo evita en ambos casos.

---

## ¿La range anxiety desaparece sola?

Según [datos de Plug In America de 2025](https://solartechonline.com/blog/ev-range-anxiety-complete-guide-2025/), la ansiedad de autonomía afecta al **48% de los compradores potenciales** antes de adquirir el auto. Después de la compra, ese número baja al **22%**. Y según la AAA, en la mayoría de los casos desaparece completamente en el primer mes.

La experiencia real reemplaza el miedo imaginado. Cada vez que llegás a casa con batería de sobra, cada vez que salís en un viaje largo sin drama, el cerebro actualiza su modelo del riesgo.

La range anxiety, en definitiva, es una ansiedad de transición: la que sentimos ante lo desconocido antes de tener experiencia directa.

---

## Planificá tus rutas largas con DóndeCargar

Para el 95% del uso diario, la range anxiety no tiene base real. Para el 5% de viajes largos, la planificación la elimina completamente.

El [planificador de rutas de DóndeCargar](https://dondecargar.com.ar/ruta) te muestra todos los cargadores disponibles entre tu origen y destino, con distancias, tipos de conector y alertas si hay un tramo donde tu autonomía podría no alcanzar.

[→ Planificá tu próximo viaje en dondecargar.com.ar/ruta](https://dondecargar.com.ar/ruta)

---

## Preguntas frecuentes

### ¿Qué pasa si me quedo sin batería en la ruta?

Lo mismo que con un auto a nafta: llamás a una grúa. Pero es aún más raro que quedarse sin nafta, porque en casa cargás todas las noches. Los casos de quedar varado por batería baja representan menos del 2% de los problemas en ruta de los eléctricos, [según datos de 2024](https://www.electriccarscheme.com/blog/range-anxiety-is-it-real).

### ¿El frío afecta mucho la autonomía?

Sí, las bajas temperaturas reducen la autonomía entre un 15% y un 30% dependiendo del modelo y la temperatura. En Argentina, esto es relevante en invierno en Patagonia o en días muy fríos en Buenos Aires. La solución: preacondicioná la batería con el auto enchufado antes de salir (la mayoría de los modelos modernos lo permite desde la app).

### ¿Cuánto tarda cargar un eléctrico en casa?

Con un tomacorriente doméstico estándar (220V / 10A), entre 8 y 12 horas para una carga completa desde vacío — lo que dura una noche. Con un Wallbox de 7 kW, entre 3 y 6 horas. La mayoría de los usuarios no llega al garaje con la batería vacía: cargás 20–40% cada noche.

### ¿Los autos eléctricos baratos también tienen buena autonomía?

El BYD Dolphin Mini, el auto eléctrico más vendido de Argentina en [abril 2026](https://www.ambito.com/autos/cuales-son-los-electricos-mas-vendidos-argentina-2026-n6274591), tiene una autonomía real de ~190–210 km. Para uso urbano en Buenos Aires, eso cubre más de una semana de manejo promedio. La range anxiety con este modelo es prácticamente nula para uso cotidiano.

### ¿Cómo sé si hay cargadores cerca de donde vivo?

Buscá tu barrio o ciudad en [dondecargar.com.ar](https://dondecargar.com.ar). El directorio tiene más de 260 puntos de carga pública en Argentina, actualizados mensualmente con datos de YPF, Chargebox, Scame y otros operadores.

---

## Fuentes

- [Electric Car Scheme — "Range Anxiety in 2026: Real Concern or Outdated Myth?"](https://www.electriccarscheme.com/blog/range-anxiety-is-it-real), 2026
- [SolarTech Online — "EV Range Anxiety: Complete 2025 Guide To Understanding & Overcoming"](https://solartechonline.com/blog/ev-range-anxiety-complete-guide-2025/), 2025
- [Ampere EV — "Dispelling Range Anxiety: Data Shows EVs Have More Than Enough Range for Daily Driving"](https://ampereev.com/is-range-anxiety-still-a-barrier-for-ev-adoption/)
- [Ambito — "Cuáles son los eléctricos más vendidos en Argentina en 2026"](https://www.ambito.com/autos/cuales-son-los-electricos-mas-vendidos-argentina-2026-n6274591), 2026
- [ACARA / parrillacero5.com.ar — Kilómetros promedio anuales en Argentina](https://parrillacero5.com.ar/cuantos-kilometros-se-le-hacen-en-promedio-a-un-auto-por-ano/)`;

async function run() {
  const rows = await sql`
    INSERT INTO "BlogPost" (title, slug, excerpt, content, published, "publishedAt", "createdAt", "updatedAt")
    VALUES (${title}, ${slug}, ${excerpt}, ${content}, ${published}, NOW(), NOW(), NOW())
    RETURNING id, slug
  `;
  console.log("✅ Post insertado:", rows[0]);
}

run().catch(console.error);
