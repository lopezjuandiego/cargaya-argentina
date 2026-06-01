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

const slug = "exencion-patente-peaje-autos-electricos-buenos-aires-2026";

const content = `Si estás pensando en comprar un auto eléctrico en el área de Buenos Aires, hay un beneficio fiscal que probablemente subestimaste: **no pagás patente**. Ni en Capital. Ni en Provincia. Y si vivís o manejás en CABA, tampoco pagás peaje en las autopistas urbanas.

No son descuentos: son exenciones totales. Y en algunos casos, están garantizadas por ley sin fecha de vencimiento.

Esta guía te explica exactamente qué aplica en cada jurisdicción, qué condiciones hay que cumplir y cuánto representan en plata real.

> **Resumen rápido**
>
> - **Autos eléctricos en CABA:** exentos del 100% de la patente sin importar precio ni antigüedad; el beneficio es **automático**, no requiere ningún trámite
> - **Autos eléctricos en Provincia de Buenos Aires:** exentos del 100% de la patente bajo ARBA, con condiciones
> - **Autos híbridos en CABA:** exentos los primeros 1–2 años según valuación, luego pagan de forma gradual
> - **Peajes en CABA:** eléctricos no pagan nada; híbridos 50% de descuento — este sí requiere tramitarlo en AUSA
> - **El patentamiento inicial** (la primera inscripción) tiene el mismo costo que cualquier auto: ~1% del valor del vehículo

---

## ¿Qué es la patente y cuánto vale?

La "patente" es el nombre popular del **impuesto automotor**, un tributo anual (o mensual, según la jurisdicción) que aplica sobre la tenencia de un vehículo. No confundir con el **patentamiento**, que es el trámite único de inscripción cuando comprás el auto — ese sí tiene un costo puntual.

El impuesto automotor generalmente ronda entre el **1% y el 5% del valor fiscal del vehículo por año**. Para un auto eléctrico de USD 25.000, eso puede representar entre $300.000 y $1.500.000 anuales según el modelo y el valor actualizado. No es menor.

La buena noticia: si el auto es eléctrico, **ese costo es cero** en CABA y en Provincia de Buenos Aires.

---

## Ciudad Autónoma de Buenos Aires (CABA)

### Autos 100% eléctricos: exención total, permanente y automática

Los autos eléctricos puros están **completamente exentos del impuesto automotor en CABA**, y el beneficio **se aplica de manera automática**: la AGIP lo carga directamente en tu boleta sin que tengas que hacer ningún trámite, presentar documentación ni solicitarlo.

La exención no tiene límite de valuación fiscal, no tiene límite de antigüedad del vehículo y no vence por el paso del tiempo.

No importa si tu Tesla cuesta USD 80.000 o si tu BYD Dolphin Mini cuesta USD 22.000: en ambos casos, **patente cero, sin trámite**.

Esto está establecido por la **Ley 6825/2024** y administrado por la AGIP (Administración Gubernamental de Ingresos Públicos de la Ciudad).

### Autos híbridos: régimen escalonado desde 2025

Para los híbridos (HEV, PHEV y MHEV), el esquema cambió en 2025. Ya no aplica la exención indefinida: ahora hay un sistema progresivo que depende de la **valuación fiscal del vehículo al momento del patentamiento**. Igual que los eléctricos, el beneficio se aplica **automáticamente en la boleta**.

**Híbridos con valuación al patentar menor a $60 millones:**

| Año desde el patentamiento | Porcentaje del impuesto que pagás |
|---|---|
| Año 1 y 2 | 0% (exento total) |
| Año 3 | 40% |
| Año 4 | 60% |
| Año 5 | 80% |
| Año 6 en adelante | 100% |

**Híbridos con valuación al patentar mayor a $60 millones (o mayor a $91.150.000 en 2026):**

| Año desde el patentamiento | Porcentaje del impuesto que pagás |
|---|---|
| Año 1 | 0% (exento total) |
| Año 2 en adelante | 100% |

El corte de valuación se actualiza anualmente según la inflación. Para 2026, la AGIP confirmó que los híbridos que durante 2025 estaban en su primer año de exención (valuación > $60M) pasan en 2026 a pagar el 100% — no es que les quitaron un beneficio, sino que venció el período de gracia que la propia ley preveía.

> La AGIP aclaró que "no se quitó ningún beneficio a los híbridos": el régimen simplemente avanza según los plazos establecidos desde el principio por la Ley 6825/2024.

---

## Provincia de Buenos Aires

### Autos eléctricos: exención total, con condiciones

Los vehículos eléctricos puros están **exentos del impuesto automotor en toda la Provincia de Buenos Aires**. La administración está a cargo de ARBA (Agencia de Recaudación de la Provincia de Buenos Aires).

Sin embargo, a diferencia de CABA donde la exención es incondicional, en PBA hay dos condiciones para acceder al beneficio:

1. **No tener deudas exigibles** de períodos fiscales anteriores con ARBA
2. **El vehículo debe tributar bajo jurisdicción provincial (ARBA)**, no municipal. Algunos modelos según su categoría o radicación pueden pasar a jurisdicción del municipio correspondiente, en cuyo caso hay que consultar directamente con ese municipio

Si tu auto cumple estas condiciones, la exención aplica y se refleja en la liquidación de ARBA.

### Autos híbridos: dos años de exención + escala progresiva

En PBA, los híbridos tienen **exención total durante los dos primeros años** desde el patentamiento. A partir del tercer año comienzan a pagar de forma gradual:

| Año desde el patentamiento | Beneficio |
|---|---|
| Año 1 y 2 | Exención total |
| Año 3 | 60% de descuento |
| Año 4 | 40% de descuento |
| Año 5 | 20% de descuento |
| Año 6 en adelante | Pago completo |

### Cambios en el esquema de pago de ARBA para 2026

Independientemente de las exenciones, ARBA rediseñó el sistema de cobro del impuesto automotor para 2026:

- Los pagos pasan de bimestrales a **mensuales**
- La alícuota mínima bajó de 3,64% a **1%**
- La alícuota máxima bajó de 5% a **4,5%**
- La reducción general en la carga impositiva es de entre **30% y 60%** respecto a 2025, según el valor del vehículo

Para los dueños de autos eléctricos esto es académico — no pagan de todas formas. Pero si tenés un híbrido que empezó a pagar, el nuevo esquema es significativamente más liviano que el anterior.

---

## Peajes en CABA: exención para eléctricos, 50% de descuento para híbridos

### ¿En qué autopistas aplica?

El beneficio rige en **todas las autopistas y autovías de la Ciudad de Buenos Aires** operadas por AUSA, incluyendo:

- Autopista 25 de Mayo
- Autopista Perito Moreno
- Autopista Illia
- Autopista Lugones
- Autopista Cantilo

No aplica a autopistas provinciales (Panamericana, Acceso Oeste, etc.) ni a los corredores viales nacionales.

### ¿Cuánto descuento?

| Tipo de vehículo | Descuento en peaje |
|---|---|
| Auto 100% eléctrico | 100% (no pagás nada) |
| Auto híbrido (HEV, PHEV, MHEV) | 50% |

### Cómo tramitarlo (es el único beneficio que requiere trámite)

A diferencia de la patente, **la exención de peaje no es automática**: hay que tramitarla una vez al año.

**Requisitos:**
1. Tener el auto inscripto en **TelePASE** (el sistema de peaje electrónico — gratuito en telepase.com.ar)
2. Presentar la **cédula verde** del vehículo

**Dónde tramitarlo:**
Oficinas de **AUSA**, en:
- **Av. Dellepiane y Piedras**, Parque Avellaneda (punto habilitado para este beneficio)

**Vigencia:** el beneficio dura **un año** y requiere renovación anual si el gobierno extiende la medida. Hasta agosto de 2026 está confirmado.

---

## El patentamiento inicial: ¿tiene descuentos para eléctricos?

**El patentamiento** (la primera inscripción cuando comprás el auto) **no tiene descuentos especiales por ser eléctrico**. El costo es el mismo que para cualquier auto:

- **~1% del valor del vehículo** (para autos nacionales, de Mercosur o México)
- Más el **impuesto de sellos** (varía según la provincia)

Para un auto de $30.000.000, el patentamiento ronda los $300.000–$350.000 aproximadamente.

**Documentación necesaria** (idéntica a cualquier auto):
- DNI y CUIT/CUIL del comprador
- Factura de compra original
- Formulario 12 (verificación policial)
- Certificado de fabricación o importación
- Solicitud Tipo 01

**Novedad 2025:** desde febrero de 2025 existe el **Registro Único Virtual (RUV)**, que permite la inscripción 100% digital de vehículos 0 km, sin ir al Registro del Automotor. Reduce los costos hasta un 20% y el trámite demora unas 48 horas.

---

## ¿Cuánto ahorrás por año?

Para ponerlo en perspectiva, un **BYD Atto 3** tiene un valor de mercado de aproximadamente USD 28.000.

En una zona sin exención, el impuesto automotor anual rondaría el **3% del valor fiscal**, lo que puede representar entre $1.200.000 y $1.800.000 anuales según la actualización fiscal.

Con la exención de CABA o Provincia de Buenos Aires: **$0**.

Si además usás habitualmente autopistas de CABA con 2 peajes diarios de ~$1.200 cada uno, son ~$870.000 anuales solo en peajes. Con la exención: **$0**.

**Ahorro total estimado para un eléctrico de uso urbano en CABA:**

| Concepto | Costo sin exención | Con exención |
|---|---|---|
| Impuesto automotor anual | $1.200.000–$1.800.000 | $0 |
| Peajes (uso urbano diario) | $600.000–$870.000 | $0 |
| **Total anual estimado** | **$1.800.000–$2.670.000** | **$0** |

Estos números varían con la inflación y los valores fiscales actualizados, pero la proporción se mantiene: el ahorro es real y acumulativo año a año.

---

## Comparativa rápida por jurisdicción

| Beneficio | CABA (eléctrico) | CABA (híbrido) | Provincia BA (eléctrico) | Provincia BA (híbrido) |
|---|---|---|---|---|
| Exención patente | Total y permanente | 1–2 años según valuación | Total (sin deudas ARBA) | 2 años |
| Es automática | Sí | Sí | Sí (si cumplís condiciones) | Sí |
| Exención peaje | Sí (autopistas CABA) | 50% (autopistas CABA) | No aplica | No aplica |
| Trámite requerido | Ninguno | Ninguno | Ninguno | Ninguno |
| Trámite peaje | Sí (AUSA, anual) | Sí (AUSA, anual) | — | — |

---

## Otros distritos del país con exenciones similares

Si bien esta guía se enfoca en Buenos Aires, hay **al menos 13 distritos** en Argentina con exenciones totales o parciales para eléctricos e híbridos, entre ellos:

- **Neuquén, Entre Ríos, Mendoza:** exención total para eléctricos
- **Río Negro, San Juan, Jujuy, Santa Fe, Ushuaia:** exención total para eléctricos
- **La Plata:** exención a nivel municipal
- **Chubut y San Luis:** reducciones parciales

---

## Preguntas frecuentes

### ¿Tengo que hacer algún trámite para no pagar la patente?

En CABA, **no**. La AGIP aplica la exención automáticamente en tu boleta sin que hagas nada. Lo mismo en Provincia de Buenos Aires, siempre que no tengas deudas exigibles con ARBA y tu auto esté bajo jurisdicción provincial.

El **único beneficio que requiere trámite activo** es la exención de peajes, que hay que tramitar en AUSA una vez al año.

### ¿Aplica la exención a motos eléctricas?

En CABA hay una exención específica para vehículos eléctricos de **Categoría L** (motos y ciclomotores eléctricos) que se tramita por separado en el portal del GCBA (buenosaires.gob.ar).

### ¿Un auto eléctrico importado de China tiene las mismas exenciones?

Sí. La exención no distingue por origen del vehículo sino por tecnología de propulsión. Un BYD, un Chery o un JAC completamente eléctrico tienen las mismas exenciones que un Tesla o un Audi e-tron.

### ¿Qué pasa si me mudo de CABA a Provincia (o viceversa)?

La patente se tributa en la jurisdicción de radicación del vehículo. Si cambiás de jurisdicción, hay que hacer el trámite de relocalización en el Registro del Automotor y la exención aplica según las reglas de la nueva jurisdicción.

### ¿La exención de peajes aplica en la autopista Buenos Aires–La Plata?

No. La Autopista Buenos Aires–La Plata es una concesión provincial. La exención de CABA aplica solo en autopistas dentro de la ciudad operadas por AUSA.

### ¿Necesito renovar la exención de patente cada año?

No. En CABA y en Provincia de Buenos Aires, la exención de patente para autos eléctricos es **automática y no requiere renovación**. La única que hay que renovar anualmente es la del **peaje** en AUSA.

---

## ¿Buscás cargadores cerca tuyo?

Las exenciones fiscales son solo una parte de la ecuación. Para sacarle el máximo provecho a tu auto eléctrico, necesitás saber dónde cargar, cuánto cuesta y qué conectores están disponibles.

[→ Buscá cargadores en DóndeCargar](https://dondecargar.com.ar)

---

## Fuentes

- [AGIP CABA — "Exención total para autos híbridos y eléctricos"](https://imagenes.agip.gob.ar/impuestos/patentes/exencion-total-para-autos-hibridos-y-electricos)
- [GCBA — "Impulso a la movilidad sustentable: el Gobierno porteño bonifica el peaje de autos híbridos y eléctricos"](https://buenosaires.gob.ar/noticias/impulso-la-movilidad-sustentable-el-gobierno-porteno-bonifica-el-peaje-de-autos-hibridos-y)
- [GCBA — "Exención de pago de patentes a vehículos eléctricos Categoría L"](https://buenosaires.gob.ar/infraestructura/movilidad/exencion-de-pago-de-patentes-vehiculos-electricos-categoria-l-conoce-el)
- [El Cero Km — "Exención de patentes 2025 en CABA: qué cambia para los autos híbridos y eléctricos"](https://elcerokm.com/blog/exencion-de-patentes-en-caba-que-cambia-para-los-autos-hibridos-y-electricos)
- [Ámbito — "Patentes 2026 en CABA: qué cambia para los autos híbridos y eléctricos"](https://www.ambito.com/autos/patente-2026-caba-que-cambia-los-hibridos-y-electricos-n6241313)
- [La Nación — "Patente 2026: qué autos no la pagan y quiénes deberán hacerlo desde este año"](https://www.lanacion.com.ar/autos/patente-2026-que-autos-no-la-pagan-y-quienes-deberan-hacerlo-desde-este-ano-nid28012026/)
- [Infobae — "Cuáles son los autos que pueden tramitar la exención de peajes en CABA en 2025"](https://www.infobae.com/economia/2025/02/04/cuales-son-los-autos-que-pueden-tramitar-la-exencion-de-peajes-en-caba-en-2025/)
- [Infozona — "Patentes ARBA 2026: El listado definitivo de autos que dejan de tributar en la Provincia"](https://www.infozona.com.ar/patentes-arba-listado-definitivo-autos-dejan-tributar-provincia/)
- [Panorama Registral — "Cómo patentar un auto híbrido o eléctrico en Argentina y cuánto sale"](https://panoramaregistral.com.ar/como-patentar-un-auto-hibrido-o-electrico-en-argentina-y-cuanto-sale/)
- [Infobae — "Patentes en CABA y provincia de Buenos Aires: cuánto habrá que pagar en 2026"](https://www.infobae.com/economia/2025/11/12/patentes-en-caba-y-provincia-de-buenos-aires-cuanto-habra-que-pagar-en-2026/)`;

async function run() {
  const rows = await sql`
    UPDATE "BlogPost"
    SET content = ${content}, "updatedAt" = NOW()
    WHERE slug = ${slug}
    RETURNING id, slug
  `;
  console.log("✅ Post actualizado:", rows[0]);
}

run().catch(console.error);
