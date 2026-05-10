import { config } from "dotenv";
import path from "path";
config({ path: path.resolve(process.cwd(), ".env") });
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const libsql = createClient({ url: process.env.DATABASE_URL! });
const adapter = new PrismaLibSql(libsql);
const prisma = new PrismaClient({ adapter } as never);

const chargeboxStations = [
  { name: "Sheraton Pilar", category: "Hoteles", city: "Pilar", province: "Buenos Aires", address: "Panamericana KM 49.5", postalCode: "B1629", lat: -34.443861, lng: -58.95, operator: "Chargebox" },
  { name: "Kansas Acassuso", category: "Restaurantes", city: "Acassuso", province: "Buenos Aires", address: "Av. del Libertador 15089", postalCode: "B1641", lat: -34.475734, lng: -58.515, operator: "Chargebox" },
  { name: "Carrefour Vicente Lopez Al Rio", category: "Supermercados", city: "Vicente López", province: "Buenos Aires", address: "Av. del Libertador 125", postalCode: "B1638", lat: -34.532128, lng: -58.49, operator: "Chargebox" },
  { name: "Atalaya Zarate", category: "Restaurantes", city: "Zárate", province: "Buenos Aires", address: "Colectora Norte Ruta 9, Salida 12", postalCode: "B2800", lat: -34.09, lng: -59.04, operator: "Chargebox" },
  { name: "Parking La Recova", category: "Parkings", city: "CABA", province: "Buenos Aires", address: "Posadas 1053", postalCode: "C1011", lat: -34.589644, lng: -58.378, operator: "Chargebox" },
  { name: "Buquebus Buenos Aires", category: "Aeropuertos", city: "CABA", province: "Buenos Aires", address: "Av. Antártida Argentina 821", postalCode: "C1104", lat: -34.597501, lng: -58.368, operator: "Chargebox" },
  { name: "Carrefour Alcorta", category: "Supermercados", city: "CABA", province: "Buenos Aires", address: "Jerónimo Salguero 3212", postalCode: "C1425", lat: -34.574271, lng: -58.413, operator: "Chargebox" },
  { name: "Sheraton Buenos Aires (Frente)", category: "Hoteles", city: "CABA", province: "Buenos Aires", address: "San Martín 1225", postalCode: "C1001", lat: -34.593321, lng: -58.373, operator: "Chargebox" },
  { name: "Sheraton Buenos Aires (Subsuelo 1)", category: "Hoteles", city: "CABA", province: "Buenos Aires", address: "San Martín 1225", postalCode: "C1001", lat: -34.593509, lng: -58.373, operator: "Chargebox" },
  { name: "Sheraton Buenos Aires (Subsuelo 2)", category: "Hoteles", city: "CABA", province: "Buenos Aires", address: "San Martín 1225", postalCode: "C1001", lat: -34.593509, lng: -58.373, operator: "Chargebox" },
  { name: "Sheraton Buenos Aires (Subsuelo 3)", category: "Hoteles", city: "CABA", province: "Buenos Aires", address: "San Martín 1225", postalCode: "C1001", lat: -34.593509, lng: -58.373, operator: "Chargebox" },
  { name: "Norcenter Munro", category: "Shoppings", city: "Munro", province: "Buenos Aires", address: "Esteban Echeverría 3750", postalCode: "B1605", lat: -34.514665, lng: -58.525, operator: "Chargebox" },
  { name: "Carrefour Maschwitz", category: "Supermercados", city: "Maschwitz", province: "Buenos Aires", address: "Juan Bautista Alberdi 555", postalCode: "B1623", lat: -34.396270, lng: -58.773, operator: "Chargebox" },
  { name: "Remeros Plaza", category: "Shoppings", city: "Tigre", province: "Buenos Aires", address: "Av. Sta. María de las Conchas 4711", postalCode: "B1624", lat: -34.406403, lng: -58.583, operator: "Chargebox" },
  { name: "Hotel Saint German Cariló", category: "Hoteles", city: "Cariló", province: "Buenos Aires", address: "Laurel 63", postalCode: "B7167", lat: -37.164803, lng: -56.895, operator: "Chargebox" },
  { name: "Cariló Golf", category: "Deporte/Entretenimiento", city: "Cariló", province: "Buenos Aires", address: "Ñandú 964", postalCode: "B7167", lat: -37.159840, lng: -56.893, operator: "Chargebox" },
  { name: "Carrefour Mar del Plata", category: "Supermercados", city: "Mar del Plata", province: "Buenos Aires", address: "Av. Constitución 7598", postalCode: "B7600", lat: -37.953107, lng: -57.572, operator: "Chargebox" },
  { name: "TOM Shopping Tortuguitas (1)", category: "Shoppings", city: "Tortuguitas", province: "Buenos Aires", address: "Panamericana Km 36,5", postalCode: "B1667", lat: -34.453227, lng: -58.802, operator: "Chargebox" },
  { name: "TOM Shopping Tortuguitas (2)", category: "Shoppings", city: "Tortuguitas", province: "Buenos Aires", address: "Panamericana Km 36,6", postalCode: "B1667", lat: -34.453227, lng: -58.802, operator: "Chargebox" },
  { name: "Centro Comercial Nordelta", category: "Shoppings", city: "Tigre", province: "Buenos Aires", address: "Av. de los Lagos 7008", postalCode: "B1646", lat: -34.399101, lng: -58.677, operator: "Chargebox" },
  { name: "Aeropuerto Ezeiza (1)", category: "Aeropuertos", city: "Ezeiza", province: "Buenos Aires", address: "AU Tte. Gral. Pablo Riccheri Km 33,5", postalCode: "B1802", lat: -34.812199, lng: -58.534, operator: "Chargebox" },
  { name: "Aeropuerto Ezeiza (2)", category: "Aeropuertos", city: "Ezeiza", province: "Buenos Aires", address: "AU Tte. Gral. Pablo Riccheri Km 33,5", postalCode: "B1802", lat: -34.812199, lng: -58.534, operator: "Chargebox" },
  { name: "Sport Club Martínez", category: "Deporte/Entretenimiento", city: "Martínez", province: "Buenos Aires", address: "Sebastián Elcano 1718", postalCode: "B1640", lat: -34.480119, lng: -58.498, operator: "Chargebox" },
  { name: "Carrefour San Miguel", category: "Shoppings", city: "San Miguel", province: "Buenos Aires", address: "Av. Pres. Arturo Umberto Illia 3770", postalCode: "B1613", lat: -34.531160, lng: -58.714, operator: "Chargebox" },
  { name: "Carrefour San Martín", category: "Supermercados", city: "San Martín", province: "Buenos Aires", address: "Av. San Martín 420", postalCode: "C1419", lat: -34.586570, lng: -58.537, operator: "Chargebox" },
  { name: "Parador Atalaya Chascomús", category: "Restaurantes", city: "Chascomús", province: "Buenos Aires", address: "Ruta 2 km 113", postalCode: "B7130", lat: -35.510729, lng: -58.012, operator: "Chargebox" },
  { name: "Howard Johnson Dolores (1)", category: "Hoteles", city: "Dolores", province: "Buenos Aires", address: "Belgrano 1869", postalCode: "B7100", lat: -36.313868, lng: -57.679, operator: "Chargebox" },
  { name: "Howard Johnson Dolores (2)", category: "Hoteles", city: "Dolores", province: "Buenos Aires", address: "Belgrano 1869", postalCode: "B7100", lat: -36.313868, lng: -57.679, operator: "Chargebox" },
  { name: "Sheraton Mar del Plata", category: "Hoteles", city: "Mar del Plata", province: "Buenos Aires", address: "Leandro N. Alem 4221", postalCode: "B7600", lat: -38.031689, lng: -57.543, operator: "Chargebox" },
  { name: "McDonald's San Isidro Centenario", category: "Restaurantes", city: "San Isidro", province: "Buenos Aires", address: "Av. Centenario 72", postalCode: "B1642", lat: -34.473889, lng: -58.513, operator: "Chargebox" },
  { name: "McDonald's San Isidro Club", category: "Restaurantes", city: "San Isidro", province: "Buenos Aires", address: "Blanco Encalada 564", postalCode: "B1609", lat: -34.490473, lng: -58.517, operator: "Chargebox" },
  { name: "Kansas Pilar", category: "Restaurantes", city: "Pilar", province: "Buenos Aires", address: "Ruta Panamericana Ramal Pilar Km 43.5", postalCode: "B1629", lat: -34.43745, lng: -58.914, operator: "Chargebox" },
  { name: "Carrefour Devoto", category: "Supermercados", city: "CABA", province: "Buenos Aires", address: "José Pedro Varela 4750", postalCode: "C1417", lat: -34.610818, lng: -58.503, operator: "Chargebox" },
  { name: "Carrefour Caballito", category: "Supermercados", city: "CABA", province: "Buenos Aires", address: "Av. Tte. Gral. Donato Álvarez 1351", postalCode: "C1416", lat: -34.610483, lng: -58.45, operator: "Chargebox" },
  { name: "McDonald's Av. Córdoba", category: "Restaurantes", city: "CABA", province: "Buenos Aires", address: "Av. Córdoba 3821", postalCode: "C1188", lat: -34.597483, lng: -58.413, operator: "Chargebox" },
  { name: "McDonald's Neuquén", category: "Restaurantes", city: "Neuquén", province: "Neuquén", address: "Eugenio Perticone 540", postalCode: "C8300", lat: -38.959980, lng: -68.085, operator: "Chargebox" },
  { name: "Park Zone Palermo", category: "Parkings", city: "CABA", province: "Buenos Aires", address: "Uriarte 1364", postalCode: "C1414", lat: -34.588880, lng: -58.432, operator: "Chargebox" },
  { name: "Nordelta Unido", category: "Restaurantes", city: "Tigre", province: "Buenos Aires", address: "Av. Nordelta 1670", postalCode: "B1671", lat: -34.438185, lng: -58.677, operator: "Chargebox" },
  { name: "Hotel Le Village San Martín de los Andes", category: "Hoteles", city: "San Martín de los Andes", province: "Neuquén", address: "Roca 816", postalCode: "Q8370", lat: -40.15556, lng: -71.353, operator: "Chargebox" },
  { name: "McDonald's Rosario", category: "Restaurantes", city: "Rosario", province: "Santa Fe", address: "Av. Dante Alighieri 2222", postalCode: "S2000", lat: -32.9621, lng: -60.661, operator: "Chargebox" },
  { name: "Carrefour Avellaneda", category: "Supermercados", city: "Avellaneda", province: "Buenos Aires", address: "Av. Hipólito Yrigoyen 299", postalCode: "C1064", lat: -34.660163, lng: -58.37, operator: "Chargebox" },
  { name: "Park Zone Villanueva", category: "Parkings", city: "CABA", province: "Buenos Aires", address: "Villanueva 1334", postalCode: "C1426", lat: -34.565226, lng: -58.437, operator: "Chargebox" },
  { name: "La Rural (1)", category: "Parkings", city: "CABA", province: "Buenos Aires", address: "Av. Sarmiento 2704", postalCode: "C1425", lat: -34.574271, lng: -58.412, operator: "Chargebox" },
  { name: "La Rural (2)", category: "Parkings", city: "CABA", province: "Buenos Aires", address: "Av. Sarmiento 2704", postalCode: "C1425", lat: -34.574271, lng: -58.412, operator: "Chargebox" },
  { name: "Aeroparque Parking (1)", category: "Aeropuertos", city: "CABA", province: "Buenos Aires", address: "Av. Costanera Rafael Obligado s/n", postalCode: "C1425", lat: -34.557735, lng: -58.416, operator: "Chargebox" },
  { name: "Aeroparque Parking (2)", category: "Aeropuertos", city: "CABA", province: "Buenos Aires", address: "Av. Costanera Rafael Obligado s/n", postalCode: "C1426", lat: -34.557735, lng: -58.416, operator: "Chargebox" },
  { name: "Kansas Nordelta (1)", category: "Restaurantes", city: "Nordelta", province: "Buenos Aires", address: "Av. Agustín M. García 6550", postalCode: "B1671NAF", lat: -34.401733, lng: -58.677, operator: "Chargebox" },
  { name: "Kansas Nordelta (2)", category: "Restaurantes", city: "Nordelta", province: "Buenos Aires", address: "Av. Agustín M. García 6550", postalCode: "B1671NAF", lat: -34.401733, lng: -58.677, operator: "Chargebox" },
  { name: "McDonald's General Rodríguez", category: "Restaurantes", city: "General Rodríguez", province: "Buenos Aires", address: "Colectora Acceso Oeste km 51,5", postalCode: "B1748", lat: -34.594447, lng: -59.032, operator: "Chargebox" },
  // YPF stations (known locations)
  { name: "YPF Punto Eléctrico Dolores", category: "Estaciones de servicio", city: "Dolores", province: "Buenos Aires", address: "Ruta Provincial 2, Km 202", postalCode: "B7100", lat: -36.313, lng: -57.677, operator: "YPF", powerKw: 160, connectorTypes: JSON.stringify(["CCS", "CHAdeMO", "Tipo 2"]) },
  { name: "YPF Punto Eléctrico CABA Libertador", category: "Estaciones de servicio", city: "CABA", province: "Buenos Aires", address: "Av. del Libertador y Melo", postalCode: "C1425", lat: -34.574, lng: -58.406, operator: "YPF", powerKw: 150, connectorTypes: JSON.stringify(["CCS", "CHAdeMO", "Tipo 2"]) },
  { name: "YPF Punto Eléctrico Pilar", category: "Estaciones de servicio", city: "Pilar", province: "Buenos Aires", address: "Av. Constituyentes y General Paz", postalCode: "B1629", lat: -34.443, lng: -58.857, operator: "YPF", powerKw: 150, connectorTypes: JSON.stringify(["CCS", "CHAdeMO", "Tipo 2"]) },
  // Enel X - Autopista Buenos Aires - La Plata
  { name: "Enel X Autopista La Plata (1)", category: "Autopistas", city: "Avellaneda", province: "Buenos Aires", address: "Autopista Buenos Aires - La Plata", postalCode: "", lat: -34.668, lng: -58.367, operator: "Enel X", powerKw: 50, connectorTypes: JSON.stringify(["CCS", "CHAdeMO"]) },
  { name: "Enel X Autopista La Plata (2)", category: "Autopistas", city: "Berazategui", province: "Buenos Aires", address: "Autopista Buenos Aires - La Plata", postalCode: "", lat: -34.762, lng: -58.219, operator: "Enel X", powerKw: 50, connectorTypes: JSON.stringify(["CCS", "CHAdeMO"]) },
];

async function main() {
  console.log("Seeding database...");

  for (const station of chargeboxStations) {
    await prisma.station.upsert({
      where: { id: chargeboxStations.indexOf(station) + 1 },
      update: {},
      create: {
        name: station.name,
        operator: station.operator,
        category: station.category ?? null,
        address: station.address,
        city: station.city,
        province: station.province,
        postalCode: station.postalCode ?? null,
        lat: station.lat,
        lng: station.lng,
        connectorTypes: (station as { connectorTypes?: string }).connectorTypes ?? JSON.stringify(["Tipo 2"]),
        powerKw: (station as { powerKw?: number }).powerKw ?? null,
        accessType: "public",
        isFree: station.operator === "Chargebox" ? false : false,
        source: station.operator === "Chargebox" ? "chargebox" : "manual",
        isVerified: true,
      },
    });
  }

  console.log(`Seeded ${chargeboxStations.length} stations.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
