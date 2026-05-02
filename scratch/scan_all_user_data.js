const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findAllData() {
  try {
    const apps = await prisma.kycApplication.findMany({
      where: { userId: 8 }
    });
    console.log(`Found ${apps.length} applications for user 8.`);
    for (const app of apps) {
      console.log(`--- APP: ${app.applicationId} ---`);
      console.log("Nominees:", JSON.stringify(app.nomineeDetails, null, 2));
      console.log("Bank:", JSON.stringify(app.bankDetails, null, 2));
      console.log("Address:", JSON.stringify(app.address, null, 2));
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

findAllData();
