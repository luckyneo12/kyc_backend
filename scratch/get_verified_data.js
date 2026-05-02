const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getFullData() {
  try {
    const app = await prisma.kycApplication.findUnique({
      where: { applicationId: "KYCMOIAPLTF8052" }
    });
    console.log("FULL DATA FOR KYCMOIAPLTF8052:");
    console.log(JSON.stringify(app, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

getFullData();
