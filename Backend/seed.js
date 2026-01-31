// seedUniversities.js
import prisma from "./config/dbConnect.js";

const universities = [
  {
    name: "Massachusetts Institute of Technology",
    location: "Cambridge, Massachusetts",
    country: "USA",
    ranking: 1,
    minScore: 95,
    fees: 53800,
    imageUrl: "https://images.unsplash.com/photo-1537888692311-8a7fb3e9f374?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    source: "External",
    officialWebsite: "https://www.mit.edu",
    description: "World-renowned for STEM education and research innovation."
  },
  {
    name: "Stanford University",
    location: "Stanford, California",
    country: "USA",
    ranking: 2,
    minScore: 90,
    fees: 56169,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Stanford_University_campus.jpg",
    source: "External",
    officialWebsite: "https://www.stanford.edu",
    description: "Leading private research university in Silicon Valley."
  },
  {
    name: "Harvard University",
    location: "Cambridge, Massachusetts",
    country: "USA",
    ranking: 3,
    minScore: 92,
    fees: 54500,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/70/Harvard_University_campus.jpg",
    source: "External",
    officialWebsite: "https://www.harvard.edu",
    description: "Ivy League institution with global academic reputation."
  },
  {
    name: "University of Cambridge",
    location: "Cambridge",
    country: "UK",
    ranking: 4,
    minScore: 88,
    fees: 32400,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Cambridge_University_Old_Schools.jpg",
    source: "External",
    officialWebsite: "https://www.cam.ac.uk",
    description: "Historic university with world-class research facilities."
  },
  {
    name: "University of Toronto",
    location: "Toronto, Ontario",
    country: "Canada",
    ranking: 25,
    minScore: 80,
    fees: 45700,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/40/University_of_Toronto_Hart_House.jpg",
    source: "External",
    officialWebsite: "https://www.utoronto.ca",
    description: "Canada's leading university with diverse programs."
  },
  {
    name: "University of Melbourne",
    location: "Melbourne, Victoria",
    country: "Australia",
    ranking: 33,
    minScore: 78,
    fees: 43000,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/93/University_of_Melbourne_main_gate.jpg",
    source: "External",
    officialWebsite: "https://www.unimelb.edu.au",
    description: "Top Australian university with strong research output."
  },
  {
    name: "ETH Zurich",
    location: "Zurich",
    country: "Switzerland",
    ranking: 9,
    minScore: 85,
    fees: 1300,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/71/ETH_Zurich_logo.svg",
    source: "External",
    officialWebsite: "https://ethz.ch",
    description: "European leader in science and technology education."
  },
  {
    name: "National University of Singapore",
    location: "Singapore",
    country: "Singapore",
    ranking: 11,
    minScore: 82,
    fees: 38000,
    imageUrl: "https://upload.wikimedia.org/wikipedia/en/4/4f/National_University_of_Singapore_logo.svg",
    source: "External",
    officialWebsite: "https://www.nus.edu.sg",
    description: "Asia's top university with global partnerships."
  },
  {
    name: "University of Tokyo",
    location: "Tokyo",
    country: "Japan",
    ranking: 28,
    minScore: 80,
    fees: 5350,
    imageUrl: "https://upload.wikimedia.org/wikipedia/en/3/3e/University_of_Tokyo_logo.svg",
    source: "External",
    officialWebsite: "https://www.u-tokyo.ac.jp",
    description: "Japan's premier research university."
  },
  {
    name: "University of Michigan",
    location: "Ann Arbor, Michigan",
    country: "USA",
    ranking: 23,
    minScore: 82,
    fees: 53000,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7d/University_of_Michigan_seal.svg",
    source: "External",
    officialWebsite: "https://umich.edu",
    description: "Public Ivy with strong engineering and business programs."
  }
];

async function seedUniversities() {
  try {
    for (const uni of universities) {
      await prisma.university.upsert({
        where: { name_country: { name: uni.name, country: uni.country } },
        update: {},
        create: uni
      });
    }
    console.log("✅ Universities seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding universities:", error);
  }
}

seedUniversities();

export default seedUniversities;