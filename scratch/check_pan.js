const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPan() {
  try {
    const apps = await prisma.kycApplication.findMany();
    for (const app of apps) {
      if (app.identityDetails && typeof app.identityDetails === 'object') {
        const pan = app.identityDetails.pan;
        if (pan) {
          console.log(`PAN ${pan} is linked to Application ID ${app.id} and User ID ${app.userId}`);
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPan();
