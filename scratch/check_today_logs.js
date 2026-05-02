const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllToday() {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const logs = await prisma.auditLog.findMany({
      where: { 
        timestamp: { gte: today }
      },
      orderBy: { timestamp: "desc" }
    });
    console.log(`Found ${logs.length} logs for today.`);
    for (const log of logs) {
      console.log(`[${log.timestamp.toISOString()}] Action: ${log.action} | User: ${log.userId}`);
      if (log.action.includes("failed")) {
          console.log("Details:", JSON.stringify(log.details, null, 2));
      }
      console.log("---");
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllToday();
