const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkIds() {
  try {
    const apps = await prisma.kycApplication.findMany({
      where: { applicationId: { in: ["KYCMOIAPLTF8052", "KYCMOIL9TO2E5DB", "KYCMOL2WDR6A17E"] } }
    });
    for (const app of apps) {
      console.log(`App: ${app.applicationId}, UserId: ${app.userId}, Status: ${app.status}`);
      console.log("Full Data Snapshot:", JSON.stringify(app, null, 2));
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkIds();
