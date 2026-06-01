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

const content = `Si estás pensando en comprar un auto eléctrico en el área de Buenos Aires, hay un beneficio fiscal que probablemente subestimaste: **no pagás patente en CABA**. Y si usás las autopistas urbanas de la ciudad, tampoco pagás peaje.

Esta guía te explica exactamente qué aplica en cada jurisdicción, con fuentes verificadas — incluyendo lo que encontramos y lo que no pudimos confirmar.

> **Resumen rápido**
>
> - **Autos eléctricos en CABA:** exentos del 100% de la patente, sin trámite, sin límite de valuación ni antigüedad
> - **Autos eléctricos en Provincia de Buenos Aires:** la exención existió hasta el 31/12/2025 — para 2026 **no está reglamentada** según ARBA
> - **Autos híbridos en CABA:** exentos los primeros 1–2 años según valuación, automáticamente
> - **Peajes en CABA:** eléctricos no pagan nada; híbridos 50% de descuento — requiere tramitarlo en AUSA una vez al año

---

## ¿Qué es la patente y cuánto vale?

La "patente" es el nombre popular del **impuesto automotor**, un tributo mensual que aplica sobre la tenencia de un vehículo. No confundir con el **patentamiento**, que es el trámite único de inscripción cuando comprás el auto — ese sí tiene un costo puntual.

El impuesto automotor generalmente ronda entre el **1% y el 5% del valor fiscal del vehículo por año**. Para un auto eléctrico de USD 25.000, eso puede representar entre $300.000 y $1.500.000 anuales. No es menor.

---

## Ciudad Autónoma de Buenos Aires (CABA)

### Autos 100% eléctricos: exención total, permanente y automática

Los autos eléctricos puros están **completamente exentos del impuesto automotor en CABA**, y el beneficio **se aplica de manera automática**: la AGIP lo carga directamente en tu boleta sin que tengas que hacer ningún trámite, presentar documentación ni solicitarlo.

La exención no tiene límite de valuación fiscal, no tiene límite de antigüedad del vehículo y no vence por el paso del tiempo.

No importa si tu Tesla cuesta USD 80.000 o si tu BYD Dolphin Mini cuesta USD 22.000: en ambos casos, **patente cero, sin trámite**.

Esto está establecido por la **Ley 6825/2024** y administrado por la AGIP (Administración Gubernamental de Ingresos Públicos de la Ciudad).

### Autos híbridos: régimen escalonado desde 2025

Para los híbridos (HEV, PHEV y MHEV), el esquema cambió en 2025. Ya no aplica la exención indefinida: ahora hay un sistema progresivo que depende de la **valuación fiscal del vehículo al momento del patentamiento**. El beneficio también se aplica **automáticamente en la boleta**.

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

> La AGIP aclaró que "no se quitó ningún beneficio a los híbridos": el régimen simplemente avanza según los plazos establecidos desde el principio por la Ley 6825/2024.

---

## Provincia de Buenos Aires: la situación en 2026

### La exención no está reglamentada para 2026

Esta es la parte más importante de aclarar, porque varios medios replican información desactualizada o contradictoria.

El sitio oficial de **ARBA** dice textualmente:

> *"La bonificación aplica hasta el 31 de diciembre del 2025. Para el año 2026 no se encuentra reglamentada la bonificación por Ley Impositiva."*

En la práctica esto significa que, a diferencia de CABA donde la exención para eléctricos es **permanente por ley**, en Provincia de Buenos Aires la reducción del impuesto automotor para eléctricos e híbridos dependía de una bonificación anual fijada por la Ley Impositiva provincial — y esa bonificación **no fue renovada para el ejercicio fiscal 2026** al momento de publicar este artículo.

El simulador oficial de patente de ARBA tampoco muestra categorías especiales para vehículos eléctricos o híbridos: los calcula igual que cualquier otro vehículo.

### ¿Qué hacer si tenés un eléctrico radicado en Provincia?

1. **Consultá directamente con ARBA** en arba.gob.ar o al 0800-321-2722 — es la única fuente que puede confirmar si la exención fue reglamentada después de la publicación de este artículo
2. **Verificá tu liquidación**: si la exención existe para tu vehículo, debería verse reflejada en el monto a pagar
3. **Revisá la Ley Impositiva vigente** (Ley 15.558 para ejercicio 2026) — algunos medios citan su Art. 34 como base de la exención, pero ARBA no lo refleja en su sitio ni en su simulador

> **Nota editorial:** Para este artículo consultamos el sitio oficial de ARBA, el simulador de patente provincial, y múltiples medios especializados. Los medios que afirman que la exención sigue vigente en 2026 en PBA citan fuentes secundarias que no coinciden con lo que publica ARBA directamente.

---

## Peajes en CABA: exención para eléctricos, 50% de descuento para híbridos

### ¿En qué autopistas aplica?

El beneficio rige en **todas las autopistas y autovías de la Ciudad de Buenos Aires** operadas por AUSA:

- Autopista 25 de Mayo
- Autopista Perito Moreno
- Autopista Illia
- Autopista Lugones
- Autopista Cantilo

No aplica a autopistas provinciales (Panamericana, Acceso Oeste, etc.).

### ¿Cuánto descuento?

| Tipo de vehículo | Descuento en peaje |
|---|---|
| Auto 100% eléctrico | 100% (no pagás nada) |
| Auto híbrido (HEV, PHEV, MHEV) | 50% |

### Cómo tramitarlo (único beneficio que requiere trámite)

A diferencia de la patente, **la exención de peaje no es automática**: hay que tramitarla una vez al año.

**Requisitos:**
1. Tener el auto inscripto en **TelePASE** (gratuito en telepase.com.ar)
2. Presentar la **cédula verde** del vehículo

**Dónde:**
Oficinas de **AUSA** — Av. Dellepiane y Piedras, Parque Avellaneda.

**Vigencia:** un año, con renovación anual. Hasta agosto de 2026 confirmado.

---

## El patentamiento inicial: mismo costo que cualquier auto

El patentamiento (la primera inscripción) **no tiene descuentos especiales por ser eléctrico**:

- **~1% del valor del vehículo** + impuesto de sellos
- Documentación idéntica a cualquier auto (DNI, factura, Formulario 12, Certificado de fabricación)
- **Desde febrero 2025:** existe el Registro Único Virtual (RUV) — inscripción 100% digital, ahorra hasta 20%, trámite en ~48 horas

---

## Cuánto ahorrás por año en CABA

Para un **BYD Atto 3** (~USD 28.000), el impuesto automotor anual sin exención rondaría entre $1.200.000 y $1.800.000. Sumando peajes urbanos diarios, otros $600.000–$870.000 anuales.

| Concepto | Sin exención | Con exención CABA |
|---|---|---|
| Impuesto automotor anual | $1.200.000–$1.800.000 | $0 |
| Peajes (uso urbano diario) | $600.000–$870.000 | $0 |
| **Total anual estimado** | **$1.800.000–$2.670.000** | **$0** |

---

## Comparativa rápida

| Beneficio | CABA eléctrico | CABA híbrido | PBA eléctrico | PBA híbrido |
|---|---|---|---|---|
| Exención patente | Total y permanente | 1–2 años (auto) | No reglamentada 2026 | No reglamentada 2026 |
| Requiere trámite | No | No | — | — |
| Exención peaje | Sí (autopistas CABA) | 50% (autopistas CABA) | No aplica | No aplica |
| Trámite peaje | Sí (AUSA, anual) | Sí (AUSA, anual) | — | — |

---

## Preguntas frecuentes

### ¿Tengo que hacer algún trámite para no pagar la patente en CABA?

No. La AGIP aplica la exención automáticamente en tu boleta. El único beneficio que requiere trámite activo es la exención de peajes en AUSA, una vez al año.

### ¿Los eléctricos importados de China (BYD, Chery, JAC) tienen las mismas exenciones que un Tesla?

Sí, en CABA. La exención no distingue por origen del vehículo sino por tecnología de propulsión.

### ¿La exención de peajes aplica en la Panamericana o el Acceso Oeste?

No. Solo aplica en autopistas dentro de CABA operadas por AUSA.

### ¿Qué pasa si me mudo de CABA a Provincia?

La patente se tributa en la jurisdicción de radicación. Si cambiás de jurisdicción, hay que hacer el trámite de relocalización en el Registro del Automotor.

### ¿Aplica la exención a motos eléctricas en CABA?

Sí. Hay una exención específica para vehículos de Categoría L (motos y ciclomotores eléctricos) que se tramita por separado en buenosaires.gob.ar.

---

## ¿Buscás cargadores cerca tuyo?

[→ Buscá cargadores en DóndeCargar](https://dondecargar.com.ar)

---

## Fuentes

- [AGIP CABA — "Exención total para autos híbridos y eléctricos"](https://imagenes.agip.gob.ar/impuestos/patentes/exencion-total-para-autos-hibridos-y-electricos)
- [GCBA — "Impulso a la movilidad sustentable: el Gobierno porteño bonifica el peaje de autos híbridos y eléctricos"](https://buenosaires.gob.ar/noticias/impulso-la-movilidad-sustentable-el-gobierno-porteno-bonifica-el-peaje-de-autos-hibridos-y)
- [ARBA — "Bonificación por Ley Impositiva" (no reglamentada para 2026)](https://www.arba.gov.ar/GuiaTramites/TramiteSeleccionado.asp?tramite=344)
- [El Cero Km — "Exención de patentes 2025 en CABA: qué cambia para los autos híbridos y eléctricos"](https://elcerokm.com/blog/exencion-de-patentes-en-caba-que-cambia-para-los-autos-hibridos-y-electricos)
- [Ámbito — "Patentes 2026 en CABA: qué cambia para los autos híbridos y eléctricos"](https://www.ambito.com/autos/patente-2026-caba-que-cambia-los-hibridos-y-electricos-n6241313)
- [Infobae — "Cuáles son los autos que pueden tramitar la exención de peajes en CABA en 2025"](https://www.infobae.com/economia/2025/02/04/cuales-son-los-autos-que-pueden-tramitar-la-exencion-de-peajes-en-caba-en-2025/)
- [Infozona — "ARBA cambia el Impuesto Automotor 2026"](https://www.infozona.com.ar/atencion-conductores-arba-cambia-el-impuesto-automotor-2026-fecha-limite/)
- [Panorama Registral — "Cómo patentar un auto híbrido o eléctrico en Argentina y cuánto sale"](https://panoramaregistral.com.ar/como-patentar-un-auto-hibrido-o-electrico-en-argentina-y-cuanto-sale/)
- [El Observador — "Oficial: estos modelos de autos dejan de pagar patente en la provincia de Buenos Aires" (cita Art. 34 Ley 15.558, en contradicción con lo publicado por ARBA)](https://www.elobservador.com.uy/argentina/economia-y-negocios/oficial-estos-modelos-autos-dejan-pagar-patente-la-provincia-buenos-aires-la-lista-completa-n6030549)`;

async function run() {
  const rows = await sql`
    UPDATE "BlogPost" SET content = ${content}, "updatedAt" = NOW()
    WHERE slug = ${slug} RETURNING id, slug
  `;
  console.log("✅ Post actualizado:", rows[0]);
}
run().catch(console.error);
