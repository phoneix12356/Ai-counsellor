import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const universities = [
  {
    name: "Harvard University",
    country: "USA",
    location: "Cambridge, MA",
    ranking: 1,
    minScore: 95,
    fees: 55000,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Harvard_University_coat_of_arms.svg/1200px-Harvard_University_coat_of_arms.svg.png",
    source: "External"
  },
  {
    name: "Stanford University",
    country: "USA",
    location: "Stanford, CA",
    ranking: 2,
    minScore: 94,
    fees: 56000,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Seal_of_Leland_Stanford_Junior_University.svg/1200px-Seal_of_Leland_Stanford_Junior_University.svg.png",
    source: "External"
  },
  {
    name: "MIT",
    country: "USA",
    location: "Cambridge, MA",
    ranking: 3,
    minScore: 96,
    fees: 54000,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/1200px-MIT_logo.svg.png",
    source: "External"
  },
  {
    name: "University of Oxford",
    country: "UK",
    location: "Oxford",
    ranking: 4,
    minScore: 92,
    fees: 40000,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/University_of_Oxford.svg/1200px-University_of_Oxford.svg.png",
    source: "External"
  },
  {
    name: "University of Toronto",
    country: "Canada",
    location: "Toronto",
    ranking: 21,
    minScore: 85,
    fees: 45000,
    imageUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/0/04/Utoronto_coa.svg/1200px-Utoronto_coa.svg.png",
    source: "External"
  },
  {
    name: "University of Melbourne",
    country: "Australia",
    location: "Melbourne",
    ranking: 33,
    minScore: 80,
    fees: 35000,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/University_of_Melbourne_Coat_of_Arms.svg/1200px-University_of_Melbourne_Coat_of_Arms.svg.png",
    source: "External"
  },
  {
    name: "Arizona State University",
    country: "USA",
    location: "Tempe, AZ",
    ranking: 150,
    minScore: 60,
    fees: 30000,
    imageUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arizona_State_University_seal.svg/1200px-Arizona_State_University_seal.svg.png",
    source: "External"
  },
  {
    name: "Northeastern University",
    country: "USA",
    location: "Boston, MA",
    ranking: 50,
    minScore: 75,
    fees: 52000,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Northeastern_University_seal.svg/1200px-Northeastern_University_seal.svg.png",
    source: "External"
  }
];

async function main() {
  console.log("Seeding universities...");
  for (const uni of universities) {
    await prisma.university.upsert({
      where: { name_country: { name: uni.name, country: uni.country } },
      update: {},
      create: uni,
    });
  }
  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
