const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOcrData() {
  const appId = "KYCMOL2WDR6A17E";
  try {
    const app = await prisma.kycApplication.findUnique({
      where: { applicationId: appId }
    });
    console.log("FULL OCR DATA FOR KYCMOL2WDR6A17E:");
    console.log(JSON.stringify(app.ocrData, null, 2));
    
    // Check if there is ANY field that is NOT an empty string
    const findRealData = (obj) => {
      if (!obj || typeof obj !== "object") return;
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === "string" && v.trim() !== "" && v.length > 2) {
          console.log(`FOUND DATA: ${k} = ${v}`);
        }
        findRealData(v);
      }
    };
    findRealData(app);

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkOcrData();
