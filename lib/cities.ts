export type CityResult = { lat: number; lng: number; display: string };

// Keys: lowercase, no accents, no double-spaces
const AR_CITIES: Record<string, CityResult> = {
  // ── CABA ──────────────────────────────────────────────────────────────────
  "buenos aires":       { lat: -34.6037, lng: -58.3816, display: "Buenos Aires, CABA" },
  "caba":               { lat: -34.6037, lng: -58.3816, display: "Buenos Aires, CABA" },
  "palermo":            { lat: -34.5875, lng: -58.4266, display: "Palermo, CABA" },
  "belgrano":           { lat: -34.5637, lng: -58.4578, display: "Belgrano, CABA" },
  "recoleta":           { lat: -34.5875, lng: -58.3930, display: "Recoleta, CABA" },
  "microcentro":        { lat: -34.6076, lng: -58.3712, display: "Microcentro, CABA" },
  "san telmo":          { lat: -34.6220, lng: -58.3726, display: "San Telmo, CABA" },
  "puerto madero":      { lat: -34.6118, lng: -58.3636, display: "Puerto Madero, CABA" },
  "villa crespo":       { lat: -34.5996, lng: -58.4375, display: "Villa Crespo, CABA" },
  "caballito":          { lat: -34.6177, lng: -58.4428, display: "Caballito, CABA" },
  "flores":             { lat: -34.6283, lng: -58.4605, display: "Flores, CABA" },
  "villa del parque":   { lat: -34.5984, lng: -58.4791, display: "Villa del Parque, CABA" },
  "villa devoto":       { lat: -34.5942, lng: -58.5076, display: "Villa Devoto, CABA" },
  "liniers":            { lat: -34.6393, lng: -58.5218, display: "Liniers, CABA" },

  // ── GBA NORTE ─────────────────────────────────────────────────────────────
  "olivos":             { lat: -34.5048, lng: -58.4944, display: "Olivos, Buenos Aires" },
  "san isidro":         { lat: -34.4736, lng: -58.5271, display: "San Isidro, Buenos Aires" },
  "martinez":           { lat: -34.4889, lng: -58.5125, display: "Martínez, Buenos Aires" },
  "boulogne":           { lat: -34.4870, lng: -58.5627, display: "Boulogne, Buenos Aires" },
  "vicente lopez":      { lat: -34.5260, lng: -58.4758, display: "Vicente López, Buenos Aires" },
  "florida":            { lat: -34.5218, lng: -58.4997, display: "Florida, Buenos Aires" },
  "munro":              { lat: -34.5177, lng: -58.5213, display: "Munro, Buenos Aires" },
  "tigre":              { lat: -34.4260, lng: -58.5797, display: "Tigre, Buenos Aires" },
  "nordelta":           { lat: -34.3878, lng: -58.6323, display: "Nordelta, Buenos Aires" },
  "escobar":            { lat: -34.3487, lng: -58.7944, display: "Escobar, Buenos Aires" },
  "pilar":              { lat: -34.4587, lng: -58.9143, display: "Pilar, Buenos Aires" },
  "campana":            { lat: -34.1634, lng: -58.9543, display: "Campana, Buenos Aires" },
  "zarate":             { lat: -34.0991, lng: -59.0287, display: "Zárate, Buenos Aires" },
  "san pedro":          { lat: -33.6793, lng: -59.6688, display: "San Pedro, Buenos Aires" },
  "ramallo":            { lat: -33.4862, lng: -60.0057, display: "Ramallo, Buenos Aires" },
  "san nicolas de los arroyos": { lat: -33.3367, lng: -60.2083, display: "San Nicolás de los Arroyos, Buenos Aires" },
  "san nicolas":        { lat: -33.3367, lng: -60.2083, display: "San Nicolás de los Arroyos, Buenos Aires" },
  "villa constitución": { lat: -33.2291, lng: -60.3350, display: "Villa Constitución, Santa Fe" },

  // ── GBA OESTE ─────────────────────────────────────────────────────────────
  "moron":              { lat: -34.6522, lng: -58.6197, display: "Morón, Buenos Aires" },
  "haedo":              { lat: -34.6439, lng: -58.5919, display: "Haedo, Buenos Aires" },
  "ituzaingo":          { lat: -34.6584, lng: -58.6712, display: "Ituzaingó, Buenos Aires" },
  "merlo":              { lat: -34.6644, lng: -58.7255, display: "Merlo, Buenos Aires" },
  "moreno":             { lat: -34.6452, lng: -58.7893, display: "Moreno, Buenos Aires" },
  "general rodriguez":  { lat: -34.6071, lng: -58.9566, display: "General Rodríguez, Buenos Aires" },
  "lujan":              { lat: -34.5697, lng: -59.1036, display: "Luján, Buenos Aires" },
  "marcos paz":         { lat: -34.7737, lng: -58.8324, display: "Marcos Paz, Buenos Aires" },
  "canuelas":           { lat: -35.0585, lng: -58.7615, display: "Cañuelas, Buenos Aires" },

  // ── GBA SUR ───────────────────────────────────────────────────────────────
  "lanus":              { lat: -34.7012, lng: -58.3934, display: "Lanús, Buenos Aires" },
  "avellaneda":         { lat: -34.6653, lng: -58.3656, display: "Avellaneda, Buenos Aires" },
  "quilmes":            { lat: -34.7206, lng: -58.2544, display: "Quilmes, Buenos Aires" },
  "bernal":             { lat: -34.7044, lng: -58.2898, display: "Bernal, Buenos Aires" },
  "berazategui":        { lat: -34.7622, lng: -58.2103, display: "Berazategui, Buenos Aires" },
  "florencio varela":   { lat: -34.8157, lng: -58.2775, display: "Florencio Varela, Buenos Aires" },
  "lomas de zamora":    { lat: -34.7613, lng: -58.4036, display: "Lomas de Zamora, Buenos Aires" },
  "temperley":          { lat: -34.7712, lng: -58.3950, display: "Temperley, Buenos Aires" },
  "llavallol":          { lat: -34.7959, lng: -58.3914, display: "Llavallol, Buenos Aires" },
  "almirante brown":    { lat: -34.8185, lng: -58.3985, display: "Almirante Brown, Buenos Aires" },
  "la plata":           { lat: -34.9215, lng: -57.9545, display: "La Plata, Buenos Aires" },

  // ── INTERIOR BONAERENSE ───────────────────────────────────────────────────
  "san antonio de areco":  { lat: -34.2456, lng: -59.4730, display: "San Antonio de Areco, Buenos Aires" },
  "areco":                 { lat: -34.2456, lng: -59.4730, display: "San Antonio de Areco, Buenos Aires" },
  "san andres de giles":   { lat: -34.4456, lng: -59.4486, display: "San Andrés de Giles, Buenos Aires" },
  "capilla del senor":     { lat: -34.2910, lng: -58.9367, display: "Capilla del Señor, Buenos Aires" },
  "exaltacion de la cruz": { lat: -34.2852, lng: -59.0897, display: "Exaltación de la Cruz, Buenos Aires" },
  "chacabuco":             { lat: -34.6428, lng: -60.4744, display: "Chacabuco, Buenos Aires" },
  "junin":                 { lat: -34.5833, lng: -60.9500, display: "Junín, Buenos Aires" },
  "pergamino":             { lat: -33.8899, lng: -60.5716, display: "Pergamino, Buenos Aires" },
  "arrecifes":             { lat: -34.0629, lng: -60.1069, display: "Arrecifes, Buenos Aires" },
  "salto":                 { lat: -34.2940, lng: -60.2490, display: "Salto, Buenos Aires" },
  "rojas":                 { lat: -34.1954, lng: -60.7363, display: "Rojas, Buenos Aires" },
  "lincoln":               { lat: -34.8647, lng: -61.5280, display: "Lincoln, Buenos Aires" },
  "bragado":               { lat: -35.1190, lng: -60.4897, display: "Bragado, Buenos Aires" },
  "chivilcoy":             { lat: -34.8977, lng: -60.0218, display: "Chivilcoy, Buenos Aires" },
  "suipacha":              { lat: -34.7726, lng: -59.6924, display: "Suipacha, Buenos Aires" },
  "mercedes":              { lat: -34.6500, lng: -59.4333, display: "Mercedes, Buenos Aires" },
  "navarro":               { lat: -35.0026, lng: -59.2731, display: "Navarro, Buenos Aires" },
  "lobos":                 { lat: -35.1857, lng: -59.0952, display: "Lobos, Buenos Aires" },
  "roque perez":           { lat: -35.3997, lng: -59.3367, display: "Roque Pérez, Buenos Aires" },
  "25 de mayo":            { lat: -35.4333, lng: -60.1667, display: "25 de Mayo, Buenos Aires" },
  "bolivar":               { lat: -36.2335, lng: -61.1175, display: "Bolívar, Buenos Aires" },
  "tandil":                { lat: -37.3217, lng: -59.1332, display: "Tandil, Buenos Aires" },
  "azul":                  { lat: -36.7785, lng: -59.8579, display: "Azul, Buenos Aires" },
  "olavarria":             { lat: -36.8927, lng: -60.3227, display: "Olavarría, Buenos Aires" },
  "rauch":                 { lat: -36.7741, lng: -59.0909, display: "Rauch, Buenos Aires" },
  "ayacucho":              { lat: -37.1533, lng: -58.4856, display: "Ayacucho, Buenos Aires" },
  "balcarce":              { lat: -37.8445, lng: -58.2567, display: "Balcarce, Buenos Aires" },
  "loberia":               { lat: -38.1624, lng: -58.7855, display: "Lobería, Buenos Aires" },
  "necochea":              { lat: -38.5555, lng: -58.7390, display: "Necochea, Buenos Aires" },
  "tres arroyos":          { lat: -38.3759, lng: -60.2758, display: "Tres Arroyos, Buenos Aires" },
  "coronel suarez":        { lat: -37.4609, lng: -61.9310, display: "Coronel Suárez, Buenos Aires" },
  "bahia blanca":          { lat: -38.7183, lng: -62.2663, display: "Bahía Blanca, Buenos Aires" },
  "punta alta":            { lat: -38.8780, lng: -62.0733, display: "Punta Alta, Buenos Aires" },
  "monte hermoso":         { lat: -38.9872, lng: -61.2983, display: "Monte Hermoso, Buenos Aires" },
  "chascomus":             { lat: -35.5667, lng: -58.0167, display: "Chascomús, Buenos Aires" },
  "dolores":               { lat: -36.3167, lng: -57.6833, display: "Dolores, Buenos Aires" },
  "general madariaga":     { lat: -37.0000, lng: -57.1167, display: "General Madariaga, Buenos Aires" },
  "pinamar":               { lat: -37.1102, lng: -56.8681, display: "Pinamar, Buenos Aires" },
  "villa gesell":          { lat: -37.2636, lng: -56.9706, display: "Villa Gesell, Buenos Aires" },
  "mar de las pampas":     { lat: -37.3167, lng: -56.9667, display: "Mar de las Pampas, Buenos Aires" },
  "mar del plata":         { lat: -38.0023, lng: -57.5575, display: "Mar del Plata, Buenos Aires" },
  "miramar":               { lat: -38.2701, lng: -57.8372, display: "Miramar, Buenos Aires" },
  "san clemente del tuyu": { lat: -36.3618, lng: -56.7218, display: "San Clemente del Tuyú, Buenos Aires" },
  "santa teresita":        { lat: -36.5414, lng: -56.6959, display: "Santa Teresita, Buenos Aires" },
  "las toninas":           { lat: -36.4452, lng: -56.7150, display: "Las Toninas, Buenos Aires" },
  "mar del tuyu":          { lat: -36.5869, lng: -56.6797, display: "Mar del Tuyú, Buenos Aires" },

  // ── CÓRDOBA ───────────────────────────────────────────────────────────────
  "cordoba":               { lat: -31.4135, lng: -64.1811, display: "Córdoba, Córdoba" },
  "villa carlos paz":      { lat: -31.4222, lng: -64.4975, display: "Villa Carlos Paz, Córdoba" },
  "carlos paz":            { lat: -31.4222, lng: -64.4975, display: "Villa Carlos Paz, Córdoba" },
  "alta gracia":           { lat: -31.6552, lng: -64.4317, display: "Alta Gracia, Córdoba" },
  "la falda":              { lat: -31.0925, lng: -64.4874, display: "La Falda, Córdoba" },
  "cosquin":               { lat: -31.2463, lng: -64.4614, display: "Cosquín, Córdoba" },
  "villa general belgrano": { lat: -31.9828, lng: -64.5605, display: "Villa General Belgrano, Córdoba" },
  "rio ceballos":          { lat: -31.1668, lng: -64.3256, display: "Río Ceballos, Córdoba" },
  "unquillo":              { lat: -31.2227, lng: -64.3143, display: "Unquillo, Córdoba" },
  "villa cuenca":          { lat: -31.3490, lng: -64.5070, display: "Villa Cuenca, Córdoba" },
  "villa cueva":           { lat: -31.3490, lng: -64.5070, display: "Villa Cueva, Córdoba" },
  "rio cuarto":            { lat: -33.1232, lng: -64.3493, display: "Río Cuarto, Córdoba" },
  "villa maria":           { lat: -32.4077, lng: -63.2429, display: "Villa María, Córdoba" },
  "san francisco":         { lat: -31.4284, lng: -62.0820, display: "San Francisco, Córdoba" },
  "bell ville":            { lat: -32.6291, lng: -62.6882, display: "Bell Ville, Córdoba" },
  "la carlota":            { lat: -33.4212, lng: -63.2985, display: "La Carlota, Córdoba" },
  "marcos juarez":         { lat: -32.6985, lng: -62.1055, display: "Marcos Juárez, Córdoba" },

  // ── SANTA FE ──────────────────────────────────────────────────────────────
  "rosario":               { lat: -32.9442, lng: -60.6505, display: "Rosario, Santa Fe" },
  "santa fe":              { lat: -31.6333, lng: -60.7000, display: "Santa Fe, Santa Fe" },
  "rafaela":               { lat: -31.2513, lng: -61.4879, display: "Rafaela, Santa Fe" },
  "venado tuerto":         { lat: -33.7457, lng: -61.9704, display: "Venado Tuerto, Santa Fe" },
  "reconquista":           { lat: -29.1487, lng: -59.6450, display: "Reconquista, Santa Fe" },
  "esperanza":             { lat: -31.4483, lng: -60.9316, display: "Esperanza, Santa Fe" },

  // ── MENDOZA ───────────────────────────────────────────────────────────────
  "mendoza":               { lat: -32.8908, lng: -68.8272, display: "Mendoza, Mendoza" },
  "godoy cruz":            { lat: -32.9254, lng: -68.8473, display: "Godoy Cruz, Mendoza" },
  "lujan de cuyo":         { lat: -33.0441, lng: -68.8775, display: "Luján de Cuyo, Mendoza" },
  "maipu":                 { lat: -32.9782, lng: -68.7792, display: "Maipú, Mendoza" },
  "san rafael":            { lat: -34.6177, lng: -68.3300, display: "San Rafael, Mendoza" },
  "malargue":              { lat: -35.4753, lng: -69.5836, display: "Malargüe, Mendoza" },
  "tunuyan":               { lat: -33.5771, lng: -69.0185, display: "Tunuyán, Mendoza" },
  "general alvear":        { lat: -34.9799, lng: -67.7086, display: "General Alvear, Mendoza" },

  // ── SAN LUIS ──────────────────────────────────────────────────────────────
  "san luis":              { lat: -33.3027, lng: -66.3375, display: "San Luis, San Luis" },
  "villa de merlo":        { lat: -32.3494, lng: -65.0163, display: "Villa de Merlo, San Luis" },
  "merlo san luis":        { lat: -32.3494, lng: -65.0163, display: "Villa de Merlo, San Luis" },
  "potrero de los funes":  { lat: -33.2324, lng: -66.2124, display: "Potrero de los Funes, San Luis" },

  // ── CAPITALES PROVINCIALES ────────────────────────────────────────────────
  "tucuman":               { lat: -26.8083, lng: -65.2176, display: "San Miguel de Tucumán, Tucumán" },
  "san miguel de tucuman": { lat: -26.8083, lng: -65.2176, display: "San Miguel de Tucumán, Tucumán" },
  "salta":                 { lat: -24.7821, lng: -65.4232, display: "Salta, Salta" },
  "jujuy":                 { lat: -24.1858, lng: -65.2995, display: "San Salvador de Jujuy, Jujuy" },
  "san salvador de jujuy": { lat: -24.1858, lng: -65.2995, display: "San Salvador de Jujuy, Jujuy" },
  "resistencia":           { lat: -27.4606, lng: -58.9867, display: "Resistencia, Chaco" },
  "corrientes":            { lat: -27.4806, lng: -58.8341, display: "Corrientes, Corrientes" },
  "posadas":               { lat: -27.3671, lng: -55.8961, display: "Posadas, Misiones" },
  "parana":                { lat: -31.7333, lng: -60.5333, display: "Paraná, Entre Ríos" },
  "concepcion del uruguay": { lat: -32.4878, lng: -58.2375, display: "Concepción del Uruguay, Entre Ríos" },
  "gualeguaychu":          { lat: -33.0103, lng: -58.5174, display: "Gualeguaychú, Entre Ríos" },
  "san juan":              { lat: -31.5375, lng: -68.5364, display: "San Juan, San Juan" },
  "santiago del estero":   { lat: -27.7951, lng: -64.2615, display: "Santiago del Estero" },
  "formosa":               { lat: -26.1775, lng: -58.1781, display: "Formosa, Formosa" },
  "catamarca":             { lat: -28.4696, lng: -65.7795, display: "San Fernando del Valle de Catamarca" },
  "la rioja":              { lat: -29.4130, lng: -66.8550, display: "La Rioja, La Rioja" },
  "santa rosa":            { lat: -36.6167, lng: -64.2903, display: "Santa Rosa, La Pampa" },
  "viedma":                { lat: -40.8135, lng: -62.9967, display: "Viedma, Río Negro" },
  "neuquen":               { lat: -38.9516, lng: -68.0591, display: "Neuquén, Neuquén" },
  "rawson":                { lat: -43.3002, lng: -65.1023, display: "Rawson, Chubut" },
  "comodoro rivadavia":    { lat: -45.8648, lng: -67.4979, display: "Comodoro Rivadavia, Chubut" },
  "rio gallegos":          { lat: -51.6230, lng: -69.2168, display: "Río Gallegos, Santa Cruz" },
  "ushuaia":               { lat: -54.8019, lng: -68.3030, display: "Ushuaia, Tierra del Fuego" },

  // ── PATAGONIA / TURISMO ───────────────────────────────────────────────────
  "bariloche":             { lat: -41.1335, lng: -71.3103, display: "Bariloche, Río Negro" },
  "san carlos de bariloche": { lat: -41.1335, lng: -71.3103, display: "Bariloche, Río Negro" },
  "villa la angostura":    { lat: -40.7581, lng: -71.6475, display: "Villa La Angostura, Neuquén" },
  "san martin de los andes": { lat: -40.1564, lng: -71.3542, display: "San Martín de los Andes, Neuquén" },
  "junin de los andes":    { lat: -39.9454, lng: -71.0697, display: "Junín de los Andes, Neuquén" },
  "zapala":                { lat: -38.9000, lng: -70.0667, display: "Zapala, Neuquén" },
  "trelew":                { lat: -43.2489, lng: -65.3059, display: "Trelew, Chubut" },
  "puerto madryn":         { lat: -42.7692, lng: -65.0385, display: "Puerto Madryn, Chubut" },
  "el calafate":           { lat: -50.3402, lng: -72.2647, display: "El Calafate, Santa Cruz" },
  "el chalten":            { lat: -49.3309, lng: -72.8869, display: "El Chaltén, Santa Cruz" },
  "rio grande":            { lat: -53.7878, lng: -67.7027, display: "Río Grande, Tierra del Fuego" },
};

function normalizeKey(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const row = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = row[j];
      row[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, row[j], row[j - 1]);
      prev = temp;
    }
  }
  return row[n];
}

export function lookupCity(q: string): CityResult | null {
  const key = normalizeKey(q);
  if (AR_CITIES[key]) return AR_CITIES[key];

  // Fuzzy fallback: 1 edit for ≤8 chars, 2 for longer
  const maxDist = key.length <= 8 ? 1 : 2;
  let best: CityResult | null = null;
  let bestDist = maxDist + 1;
  for (const [cityKey, cityData] of Object.entries(AR_CITIES)) {
    const d = levenshtein(key, cityKey);
    if (d < bestDist) { bestDist = d; best = cityData; }
  }
  return bestDist <= maxDist ? best : null;
}

export function searchCities(query: string, limit = 6): CityResult[] {
  const q = normalizeKey(query);
  if (q.length < 2) return [];

  const results: Array<{ city: CityResult; score: number }> = [];

  for (const [key, city] of Object.entries(AR_CITIES)) {
    let score = 0;
    if (key === q) {
      score = 1000;
    } else if (key.startsWith(q)) {
      score = 500 - key.length;
    } else if (key.includes(q)) {
      score = 300 - key.length;
    } else if (q.length >= 3) {
      // Check if query matches any word within the key
      const words = key.split(" ");
      if (words.some((w) => w.startsWith(q))) {
        score = 200 - key.length;
      } else if (q.length >= 4 && levenshtein(q, key.slice(0, q.length)) <= 1) {
        score = 100 - key.length;
      }
    }
    if (score > 0) results.push({ city, score });
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.city);
}
