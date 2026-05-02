const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findValues() {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { 
        userId: 8,
        action: "digio_response_fetched"
      }
    });
    console.log(`Checking ${logs.length} DigiLocker responses...`);
    for (const log of logs) {
       console.log(`Log ${log.id} details:`, JSON.stringify(log.details, null, 2));
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

findValues();
