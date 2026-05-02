const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLogStructure() {
  try {
    const log = await prisma.auditLog.findFirst({
      where: { action: "kyc_step_saved" },
      orderBy: { timestamp: "desc" }
    });
    console.log("LOG STRUCTURE:");
    console.log(JSON.stringify(log, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkLogStructure();
