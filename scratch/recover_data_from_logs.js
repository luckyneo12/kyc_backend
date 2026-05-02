const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function recoverData() {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { action: 'save-step' },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    console.log("--- DATA RECOVERY ATTEMPT ---");
    logs.forEach(log => {
      const data = log.details?.data || {};
      const hasPersonal = data.personalDetails && Object.keys(data.personalDetails).length > 0;
      const hasNominees = data.nomineeDetails?.nominees?.some(n => n.name);
      
      if (hasPersonal || hasNominees) {
        console.log(`\n[${log.timestamp}] App: ${log.details?.applicationId}`);
        if (hasPersonal) console.log(`Personal Found:`, JSON.stringify(data.personalDetails, null, 2));
        if (hasNominees) console.log(`Nominees Found:`, JSON.stringify(data.nomineeDetails, null, 2));
      }
    });
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

recoverData();
