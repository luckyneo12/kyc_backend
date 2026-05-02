const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOldApp() {
  try {
    const app = await prisma.kycApplication.findUnique({
      where: { applicationId: "KYCMOIL9TO2E5DB" }
    });
    console.log("DATA FOR KYCMOIL9TO2E5DB:");
    console.log(JSON.stringify(app, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkOldApp();
