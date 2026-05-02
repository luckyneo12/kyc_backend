const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllApps() {
  const userId = 8;
  try {
    const apps = await prisma.kycApplication.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
    console.log(`FOUND ${apps.length} APPLICATIONS FOR USER ${userId}:`);
    console.log(JSON.stringify(apps, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllApps();
