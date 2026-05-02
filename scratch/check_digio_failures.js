const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFailedRequests() {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { 
        action: { in: ["digio_request_failed", "digio_request_created"] },
        timestamp: { gte: new Date(Date.now() - 24 * 3600000) } // Last 24h
      },
      orderBy: { timestamp: "desc" }
    });
    console.log(`Found ${logs.length} relevant logs in last 24h.`);
    for (const log of logs) {
      console.log(`[${log.timestamp.toISOString()}] Action: ${log.action}`);
      console.log("Details:", JSON.stringify(log.details, null, 2));
      console.log("---");
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkFailedRequests();
