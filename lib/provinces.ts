// Slug → nombre oficial de provincia
export const PROVINCE_SLUGS: Record<string, string> = {
  "buenos-aires": "Buenos Aires",
  "ciudad-autonoma-de-buenos-aires": "Ciudad Autónoma de Buenos Aires",
  "cordoba": "Córdoba",
  "santa-fe": "Santa Fe",
  "mendoza": "Mendoza",
  "entre-rios": "Entre Ríos",
  "tucuman": "Tucumán",
  "salta": "Salta",
  "misiones": "Misiones",
  "corrientes": "Corrientes",
  "chaco": "Chaco",
  "santiago-del-estero": "Santiago del Estero",
  "san-juan": "San Juan",
  "jujuy": "Jujuy",
  "rio-negro": "Río Negro",
  "neuquen": "Neuquén",
  "formosa": "Formosa",
  "chubut": "Chubut",
  "san-luis": "San Luis",
  "catamarca": "Catamarca",
  "la-rioja": "La Rioja",
  "la-pampa": "La Pampa",
  "santa-cruz": "Santa Cruz",
  "tierra-del-fuego": "Tierra del Fuego",
};

export function provinceToSlug(province: string): string {
  return province
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-");
}

export function slugToProvince(slug: string): string | null {
  return PROVINCE_SLUGS[slug] ?? null;
}

export function cityToSlug(city: string): string {
  return city
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
