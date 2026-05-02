const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getRichLog() {
  try {
    const log = await prisma.auditLog.findFirst({
      where: { 
        action: "digio_request_failed",
        timestamp: {
          gte: new Date("2026-04-30T06:40:00Z") // 12:10 PM IST
        }
      },
      orderBy: { timestamp: "desc" }
    });
    console.log("RICH LOG DETAILS:");
    console.log(JSON.stringify(log, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

getRichLog();
