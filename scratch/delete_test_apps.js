const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteTestApps() {
  try {
    console.log("Deleting test applications...");
    
    // Delete apps that have the specific test PANs
    const apps = await prisma.kycApplication.findMany();
    for (const app of apps) {
      if (app.identityDetails && typeof app.identityDetails === 'object') {
        const pan = app.identityDetails.pan;
        if (pan) {
          console.log(`Deleting application ${app.id} linked to PAN ${pan}`);
          await prisma.kycApplication.delete({ where: { id: app.id } });
        }
      }
    }
    console.log("Cleanup complete!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteTestApps();
