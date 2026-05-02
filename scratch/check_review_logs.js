const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkReviewLogs() {
  const appId = "KYCMOL2WDR6A17E";
  try {
    const allLogs = await prisma.auditLog.findMany({
      where: { action: "review_application" },
      orderBy: { timestamp: "desc" }
    });
    const logs = allLogs.filter(l => l.details && l.details.applicationId === appId);
    console.log(`Found ${logs.length} review logs.`);
    console.log(JSON.stringify(logs, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkReviewLogs();
