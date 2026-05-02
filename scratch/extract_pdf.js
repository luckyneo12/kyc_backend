const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function extractPdf() {
  const appId = "KYCMOL2WDR6A17E";
  try {
    const app = await prisma.kycApplication.findUnique({
      where: { applicationId: appId },
      select: { generatedPdfBase64: true }
    });
    
    if (app && app.generatedPdfBase64) {
      // The string might be a data URL or just base64
      const base64Data = app.generatedPdfBase64.replace(/^data:application\/pdf;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      
      const outputPath = path.join(__dirname, 'recovered_application.pdf');
      fs.writeFileSync(outputPath, buffer);
      
      console.log("SUCCESS! PDF extracted to:", outputPath);
      console.log("Please open this file to see all the data that was entered.");
    } else {
      console.log("No PDF found for this application.");
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

extractPdf();
