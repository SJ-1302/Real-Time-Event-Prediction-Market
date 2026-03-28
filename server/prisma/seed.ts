import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding database...');
  
  const event1 = await prisma.event.create({
    data: {
      question: "Will Bitcoin exceed $100,000 by December 31, 2024?",
      categories: ["Crypto", "Finance"],
      status: "ACTIVE",
      probability: 42.0,
      totalVolume: 2400000.0,
      expirationDate: new Date("2024-12-31T23:59:59Z"),
      suggestedProbability: 40.0,
      estimatedVolume: "$2M+",
      submittedBy: "AI_AGENT"
    }
  });

  console.log(`✅ Created event: ${event1.question}`);
  console.log('🎉 Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
