const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPdf() {
  const appId = "KYCMOL2WDR6A17E";
  try {
    const app = await prisma.kycApplication.findUnique({
      where: { applicationId: appId },
      select: { generatedPdfBase64: true }
    });
    if (app && app.generatedPdfBase64) {
      console.log("PDF FOUND! Length:", app.generatedPdfBase64.length);
      // I can't easily parse PDF text in JS without dependencies, 
      // but the data might be in the context state if the user hasn't refreshed?
    } else {
      console.log("No PDF found.");
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkPdf();
