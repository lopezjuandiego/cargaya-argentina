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

const title = "Cargadores rápidos vs. lentos: cuánto tarda realmente cargar un auto eléctrico";
const slug = "cuanto-tarda-cargar-auto-electrico-cargadores-rapidos-lentos";
const excerpt = "¿Cuánto tarda cargar un auto eléctrico? Depende del cargador. Un doméstico tarda 8 horas; un DC rápido de 160 kW, 20 minutos. Explicamos los 4 tipos de carga, los tiempos reales por modelo y cuándo conviene cada uno.";
const published = false; // BORRADOR

const content = `"¿Y cuánto tardás en cargar?" Es la pregunta que más escucha cualquier dueño de un auto eléctrico. Y la respuesta honesta es: depende. Depende del cargador, del auto, de cuánta batería tenés al llegar, y de cuánta necesitás realmente.

La confusión viene de mezclar todos los casos en uno. No es lo mismo cargar en casa de noche que parar 20 minutos en un cargador DC en ruta. Son experiencias completamente distintas, con lógicas distintas.

Esta guía te explica los 4 tipos de carga disponibles en Argentina, sus tiempos reales, y cuándo conviene usar cada uno.

> **Key Takeaways**
>
> - Un cargador doméstico (220V) agrega unos 10–15 km de autonomía por hora — suficiente para la mayoría del uso diario cargando de noche
> - Un cargador AC tipo Wallbox (7 kW) carga un auto mediano en 4–6 horas; uno de 22 kW, en 2–3 horas
> - Los cargadores DC rápidos (50–160 kW) disponibles en Ruta 2 y otras autopistas cargan del 20% al 80% en 20–45 minutos
> - Por encima del 80%, la velocidad de carga baja drásticamente para proteger la batería — planificá para no esperar ese tramo
> - El [planificador de DóndeCargar](https://dondecargar.com.ar/ruta) muestra qué tipo de cargador hay en cada parada de tu ruta

---

## La fórmula que lo explica todo

Antes de entrar en los tipos, hay una fórmula sencilla que te permite calcular cualquier tiempo de carga:

**Tiempo de carga = Capacidad de la batería (kWh) ÷ Potencia del cargador (kW)**

Ejemplo: BYD Atto 3 con batería de 60 kWh conectado a un Wallbox de 7 kW:
**60 ÷ 7 = ~8,5 horas** para ir de 0% a 100%.

En la práctica nunca cargás de 0% a 100% (llegás con algo de batería, y parás antes del 100%), así que los tiempos reales son siempre menores. Pero la fórmula te da el techo máximo.

---

## Los 4 tipos de carga: de más lenta a más rápida

### Tipo 1 — Cargador doméstico (Schuko / 220V)

El cable que viene con el auto enchufado a un tomacorriente doméstico estándar.

- **Potencia:** 2,3 kW (10A) a 3,7 kW (16A)
- **Velocidad:** agrega 10–15 km de autonomía por hora
- **Tiempo de carga completa:** 8–16 horas según el modelo
- **Dónde se usa:** en casa, de noche, como carga habitual cotidiana
- **Conector:** Schuko (el mismo de cualquier electrodoméstico) o adaptador CEE 7

**¿Cuándo conviene?** Para el 95% del uso diario urbano, es perfectamente suficiente. Llegás a casa con el 30–40% de batería, enchufás, y a la mañana siguiente tenés el 90–100%. El tiempo no es un problema porque cargás mientras dormís.

**Limitación:** No sirve para recargar en paradas cortas ni para viajes largos donde necesitás sumar cientos de kilómetros en poco tiempo.

---

### Tipo 2 — Wallbox AC (7 kW a 22 kW)

Un cargador AC instalado en casa o en estacionamientos. Requiere instalación eléctrica trifásica para los modelos de mayor potencia.

- **Potencia:** 7 kW (monofásico) a 22 kW (trifásico)
- **Velocidad:** agrega 40–100 km de autonomía por hora
- **Tiempo del 20% al 80%:** 1,5 a 4 horas
- **Dónde se usa:** hogares con instalación mejorada, parkings de shoppings y edificios, hoteles
- **Conector:** Tipo 2 (la mayoría de los autos modernos en Argentina lo traen)

**¿Cuándo conviene?** Si querés carga doméstica más rápida (por ejemplo, el auto estuvo parado solo 3 horas y necesitás salir con más carga), o si viajás con tiempo de sobra y el hotel o parking tiene Tipo 2.

**Costo de instalación en Argentina:** un Wallbox de 7 kW con instalación ronda los USD 500–900 según el electricista, el modelo y si necesitás refuerzo de tablero eléctrico.

---

### Tipo 3 — Cargador DC rápido (50 kW a 150 kW)

Carga directa de corriente continua. El cargador convierte la corriente, no el auto — por eso es mucho más rápido. Es el estándar en las autopistas argentinas.

- **Potencia:** 50 kW (estándar en YPF) a 150 kW (Shell, algunos YPF)
- **Velocidad:** agrega 100–300 km de autonomía por hora
- **Tiempo del 20% al 80%:** 20–45 minutos
- **Dónde se usa:** estaciones YPF en Ruta 2, Shell Recharge, Chargebox en corredores viales
- **Conectores:** CCS2 (el más común), CHAdeMO (menos frecuente)

**¿Cuándo conviene?** Para viajes largos donde necesitás recargar rápido y seguir. Es la parada de ruta: 20–30 minutos, un café, y seguís con 150–200 km más.

**Importante:** no todos los autos aceptan la máxima potencia del cargador. Un BYD Dolphin, por ejemplo, acepta hasta 60 kW DC. Conectarlo a un cargador de 150 kW no lo daña — simplemente carga a 60 kW, que es su límite de aceptación.

---

### Tipo 4 — Cargador DC ultra-rápido (150 kW a 350 kW+)

La categoría más potente, todavía escasa en Argentina pero en expansión. Algunos puntos de Shell y YPF ya ofrecen hasta 160 kW.

- **Potencia:** 150 kW a 350 kW (o más en modelos premium)
- **Velocidad:** agrega 300–600 km de autonomía por hora
- **Tiempo del 10% al 80%:** 10–25 minutos en autos compatibles
- **Dónde se usa:** corredores principales, puntos estratégicos de larga distancia
- **Conectores:** CCS2, NACS (Tesla y algunos nuevos modelos)

**¿Cuándo conviene?** Cuando tu auto lo soporta y la parada tiene que ser mínima. Los modelos disponibles en Argentina que mejor aprovechan esta potencia son el BYD Seal y el VW ID.4 en su versión de mayor batería.

---

## Tabla de tiempos de carga por modelo y tipo de cargador

Tiempos estimados de 20% a 80% (el rango más eficiente):

| Modelo | Batería | Doméstico 3,7 kW | Wallbox 7 kW | DC 50 kW | DC 100 kW |
|---|---|---|---|---|---|
| BYD Dolphin Mini | 38 kWh | ~5,5 h | ~3 h | ~35 min | ~22 min |
| BYD Dolphin | 44 kWh | ~6,5 h | ~3,5 h | ~38 min | ~26 min |
| BYD Atto 3 | 60 kWh | ~8,5 h | ~4,5 h | ~45 min | ~30 min |
| Chery Tiggo 8 EV | 68 kWh | ~10 h | ~5 h | ~50 min | ~32 min |
| BYD Seal | 82 kWh | ~12 h | ~6,5 h | ~55 min | ~35 min |
| Volkswagen ID.4 | 77 kWh | ~11 h | ~5,5 h | ~50 min | ~32 min |

*Tiempos aproximados. La velocidad real varía según temperatura de la batería, estado inicial de carga y limitaciones del auto.*

---

## La regla del 80%: por qué no conviene cargar hasta el 100% en ruta

Esta es la regla más importante para viajes largos y muchos usuarios no la conocen.

Las baterías de litio tienen un comportamiento no lineal: cargan rápido hasta el 80%, y luego el sistema de gestión de batería (BMS) baja la potencia de carga progresivamente para proteger las celdas. Ir del 80% al 100% puede tomar tanto tiempo como ir del 20% al 80%.

**Ejemplo real con un cargador DC de 50 kW:**
- Del 20% al 80%: ~40 minutos
- Del 80% al 100%: ~35–45 minutos adicionales
- **Total 20% a 100%: ~75–85 minutos**

Moraleja: en una parada de ruta, cargás al 80% y seguís. Llegás al destino con margen, cargás el resto ahí con más calma (o en casa esa noche).

---

## ¿Cuánto cuesta cargar en Argentina?

Los precios varían significativamente según el operador y el tipo de cargador:

**En casa (cargador doméstico):**
El costo es el de la tarifa eléctrica residencial. En la Argentina de 2026, es la opción más barata por amplio margen — varios veces más económica que la nafta por kilómetro.

**En cargadores públicos AC (Tipo 2, Wallbox):**
Muchos parkings y hoteles incluyen la carga en el precio del estacionamiento o habitación. Algunos cobran por hora de conexión.

**En cargadores DC rápidos (YPF, Shell Recharge, Chargebox):**
El precio varía por operador y puede ser por kWh o por sesión/tiempo. Shell Recharge requiere su propia app. YPF y Chargebox tienen tarifas variables según el punto.

> Para comparar costos actualizados y disponibilidad en tiempo real, revisá cada estación en [dondecargar.com.ar](https://dondecargar.com.ar).

---

## Paso a paso: cómo elegir qué cargador usar

### Paso 1: Definí cuánto tiempo tenés

- **Toda la noche:** cargador doméstico en casa, sin dudas
- **3 a 6 horas:** Wallbox AC en el parking donde estés
- **20 a 45 minutos:** cargador DC rápido en una estación de servicio
- **Menos de 20 minutos:** cargador DC ultra-rápido si tu auto lo soporta

### Paso 2: Verificá qué acepta tu auto

No todos los autos aceptan DC rápido. Chequeá en el manual o en la ficha técnica:
- **CCS2 DC:** la mayoría de los autos nuevos en Argentina (BYD, VW, Chery, JAC)
- **Tipo 2 AC:** todos los autos modernos lo traen
- **CHAdeMO:** menos común, algunos Nissan Leaf de primera generación
- **Potencia máxima de carga DC del vehículo:** dato clave para saber qué tan rápido carga en un DC

### Paso 3: Identificá los cargadores disponibles en tu recorrido

Antes de un viaje largo, revisá el [planificador de DóndeCargar](https://dondecargar.com.ar/ruta). Muestra qué tipo de cargador hay en cada punto del corredor, el conector disponible, y si hay gap donde tu autonomía podría no alcanzar.

### Paso 4: Cargá al 80% y seguí

En cargadores DC de ruta, no esperes el 100%. Cargá al 80% y calculá si alcanzás al próximo punto o al destino. Si sí, seguí. Ese 20% final lo completás con calma en destino.

### Paso 5: En casa, cargá de noche

El hábito más eficiente del dueño de un eléctrico: enchufarlo al llegar a casa, todos los días, sin pensar. Cargás de noche, salís con la batería al tope cada mañana.

---

## Errores comunes al cargar

**Esperar siempre el 100%.** En cargadores DC de ruta, el tramo del 80% al 100% es el más lento y el menos necesario. Perdés tiempo sin ganar mucho rango útil.

**Llegar al cargador DC con la batería fría.** En días de bajas temperaturas, las baterías aceptan menos potencia hasta que se calientan. Algunos autos tienen preacondicionamiento de batería — activalo antes de llegar al cargador.

**Conectar un auto sin CCS2 a un cargador DC.** Si tu auto solo tiene Tipo 2 AC, un cargador DC rápido no te sirve aunque tengas el adaptador físico. Son tecnologías distintas.

**No verificar el conector antes del viaje.** Llegás a Dolores y el único cargador disponible es CHAdeMO, pero tu auto usa CCS2. Revisá siempre en [DóndeCargar](https://dondecargar.com.ar) antes de salir.

---

## Encontrá cargadores para tu próxima parada

Sabiendo el tipo de cargador que necesitás, el paso siguiente es encontrar dónde están en tu recorrido.

El [planificador de rutas de DóndeCargar](https://dondecargar.com.ar/ruta) te muestra todos los puntos de carga en el corredor entre tu origen y destino, con el tipo de conector disponible y la potencia. Podés filtrar por CCS2, Tipo 2, CHAdeMO o NACS para ver solo los compatibles con tu auto.

[→ Encontrá cargadores en tu ruta en dondecargar.com.ar/ruta](https://dondecargar.com.ar/ruta)

---

## Preguntas frecuentes

### ¿Cuánto tarda cargar un auto eléctrico de cero a cien por ciento?

Depende del cargador. Con un doméstico estándar (3,7 kW), un auto mediano como el BYD Atto 3 tarda unas 12–14 horas en carga completa. Con un Wallbox de 7 kW, unas 6–8 horas. Con un cargador DC rápido de 50 kW, llegás al 80% en unos 40–50 minutos. En la práctica, la carga completa desde cero es rara: la mayoría carga parcialmente cada noche.

### ¿Puedo cargar mi auto eléctrico en cualquier enchufe doméstico?

Sí, con el cable que viene de fábrica. Los tomacorrientes argentinos de 220V funcionan, aunque la carga es lenta (2,3–3,7 kW). Para corrientes más altas (necesarias para Wallbox), es fundamental que un electricista verifique la capacidad del tablero y el cableado.

### ¿Qué diferencia hay entre CCS2 y Tipo 2?

Son dos conectores distintos para dos tipos de carga distintos. Tipo 2 es el estándar para carga AC (lenta/media, hasta 22 kW). CCS2 (Combo 2) es el estándar para carga DC rápida (desde 50 kW en adelante) y tiene un puerto adicional debajo del Tipo 2. Muchos autos modernos traen ambos en la misma entrada.

### ¿Los cargadores rápidos dañan la batería?

No, si el auto está diseñado para recibirlos. El sistema de gestión de batería (BMS) regula la potencia entrante para proteger las celdas. Lo que sí desgasta más la batería es cargar siempre al 100% y dejarla descargar al 0% repetidamente. Para uso cotidiano, se recomienda mantenerla entre 20% y 80%.

### ¿Hay cargadores rápidos DC en Argentina fuera de Buenos Aires?

Sí, aunque la cobertura es desigual. Los corredores más equipados son Ruta 2 (hacia Mar del Plata), Ruta 9 (hacia Córdoba y Rosario) y algunos puntos en Mendoza. Buscá en [dondecargar.com.ar](https://dondecargar.com.ar) por ciudad o usá el planificador de rutas para ver los DC disponibles en tu recorrido específico.

---

## Fuentes

- [VEGA Chargers — "Diferencias clave entre carga rápida DC y carga lenta AC"](https://www.vegachargers.com/carga-rapida-carga-lenta-vehiculos-electricos/)
- [US Department of Transportation — "Charger Types and Speeds"](https://www.transportation.gov/rural/ev/toolkit/ev-basics/charging-speeds)
- [EV Charging Blog — "EV Charging Levels Explained: Level 1 vs Level 2 vs Level 3"](https://evcharging.blog/ev-charging-levels-explained/)
- [Mundo SUV — "Por qué la carga de un auto eléctrico es 'lenta' en Argentina"](https://mundosuv.com/contenido/1029/donde-cargar-un-auto-electrico-en-argentina)
- [Floox Power — "¿Qué velocidades de carga existen para recargar un vehículo eléctrico?"](https://www.flooxpower.com/blog/velocidad-carga-coche-electrico/)`;

async function run() {
  const rows = await sql`
    INSERT INTO "BlogPost" (title, slug, excerpt, content, published, "publishedAt", "createdAt", "updatedAt")
    VALUES (${title}, ${slug}, ${excerpt}, ${content}, ${published}, NULL, NOW(), NOW())
    RETURNING id, slug, published
  `;
  console.log("✅ Borrador guardado:", rows[0]);
}

run().catch(console.error);
