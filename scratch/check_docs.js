const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDocs() {
  try {
    const app = await prisma.kycApplication.findUnique({
      where: { applicationId: "KYCMOIL9TO2E5DB" }
    });
    console.log("DOCUMENTS FOR KYCMOIL9TO2E5DB:");
    console.log("PAN Upload:", JSON.stringify(app.panUpload, null, 2));
    console.log("Signature:", JSON.stringify(app.signature, null, 2));
    console.log("Selfie:", JSON.stringify(app.selfieDetails, null, 2));
    console.log("Financial:", JSON.stringify(app.financialProof, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkDocs();
