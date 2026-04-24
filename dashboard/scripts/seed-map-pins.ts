import { PrismaClient, PinCategory } from "@prisma/client";

const prisma = new PrismaClient();

const PINS = [
  { label: "Main Stage", category: PinCategory.SCENE,    lat: 47.60590, lon: 3.94960, description: "Scène principale" },
  { label: "After",      category: PinCategory.SCENE,    lat: 47.60560, lon: 3.94930, description: "Scène after" },
  { label: "Bar",        category: PinCategory.FOOD,     lat: 47.60600, lon: 3.95010, description: "Bar principal" },
  { label: "Cantine",    category: PinCategory.FOOD,     lat: 47.60590, lon: 3.95050, description: "Restauration sur place" },
  { label: "Foodtruck",  category: PinCategory.FOOD,     lat: 47.60578, lon: 3.95080, description: "Foodtruck" },
  { label: "WC",         category: PinCategory.SERVICES, lat: 47.60635, lon: 3.94950, description: "Sanitaires nord" },
  { label: "WC",         category: PinCategory.SERVICES, lat: 47.60440, lon: 3.95040, description: "Sanitaires sud" },
  { label: "Douches",    category: PinCategory.SERVICES, lat: 47.60530, lon: 3.94820, description: "Douches zone 1" },
  { label: "Douches",    category: PinCategory.SERVICES, lat: 47.60420, lon: 3.95030, description: "Douches zone 2" },
  { label: "Poste Sécu", category: PinCategory.SERVICES, lat: 47.60555, lon: 3.94875, description: "Poste de sécurité" },
  { label: "RDR",        category: PinCategory.SERVICES, lat: 47.60580, lon: 3.95040, description: "Espace réduction des risques" },
  { label: "Entrée",     category: PinCategory.ACCESS,   lat: 47.60530, lon: 3.94800, description: "Entrée principale du festival" },
  { label: "Accueil",    category: PinCategory.INFOS,    lat: 47.60545, lon: 3.94860, description: "Accueil & information" },
  { label: "Camping",    category: PinCategory.INFOS,    lat: 47.60460, lon: 3.94950, description: "Zone camping" },
  { label: "Parking",    category: PinCategory.ACCESS,   lat: 47.60450, lon: 3.95060, description: "Parking festival" },
  { label: "Chill",      category: PinCategory.INFOS,    lat: 47.60630, lon: 3.95010, description: "Espace chill & détente" },
];

async function main() {
  const existing = await prisma.mapPin.count();
  if (existing > 0) {
    console.log(`${existing} pins already in DB — skipping seed.`);
    return;
  }
  const result = await prisma.mapPin.createMany({ data: PINS });
  console.log(`Inserted ${result.count} pins.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
