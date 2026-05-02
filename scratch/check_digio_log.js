const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDigioLog() {
  try {
    const log = await prisma.auditLog.findFirst({
      where: { action: "digio_response_fetched" },
      orderBy: { timestamp: "desc" }
    });
    console.log("DIGIO LOG STRUCTURE:");
    console.log(JSON.stringify(log, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkDigioLog();
