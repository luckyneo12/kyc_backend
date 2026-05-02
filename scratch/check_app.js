const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkApp() {
  const appId = "KYCMOL2WDR6A17E";
  try {
    const app = await prisma.kycApplication.findUnique({
      where: { applicationId: appId },
      include: { user: true }
    });
    console.log("APPLICATION DATA for " + appId + ":");
    console.log(JSON.stringify(app, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkApp();
