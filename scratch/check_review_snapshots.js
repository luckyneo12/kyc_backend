const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkReviewLogs() {
  const appId = "KYCMOL2WDR6A17E";
  try {
    const logs = await prisma.kycReviewLog.findMany({
      where: { 
        application: { applicationId: appId }
      },
      orderBy: { createdAt: "desc" }
    });
    console.log(`Found ${logs.length} review logs.`);
    for (const log of logs) {
      console.log(`Log ID: ${log.id}, Status: ${log.status}, CreatedAt: ${log.createdAt}`);
      // Check if there is ANY extra field in the model I might have missed
      console.log("Raw Log Record:", JSON.stringify(log, null, 2));
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkReviewLogs();
