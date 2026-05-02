const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRecentApps() {
  try {
    const apps = await prisma.kycApplication.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        user: true
      }
    });

    console.log("--- RECENT APPLICATIONS ---");
    apps.forEach(app => {
      console.log(`\nID: ${app.id} (${app.applicationId})`);
      console.log(`User: ${app.user?.phone} / ${app.user?.email}`);
      console.log(`Status: ${app.status}, Step: ${app.currentStep}`);
      console.log(`Personal Details:`, JSON.stringify(app.personalDetails, null, 2));
      console.log(`Nominee Details:`, JSON.stringify(app.nomineeDetails, null, 2));
      console.log(`Selfie:`, !!app.selfieDetails);
      console.log(`PanUpload:`, !!app.panUpload);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecentApps();
