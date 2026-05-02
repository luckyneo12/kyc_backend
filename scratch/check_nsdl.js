const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkNsdlRequest() {
  const appId = "KYCMOL2WDR6A17E";
  try {
    const app = await prisma.kycApplication.findUnique({
      where: { applicationId: appId }
    });
    console.log("NSDL REQUEST PAYLOAD:");
    console.log(JSON.stringify(app.nsdlRequest, null, 2));
    
    // Check if it has the missing data
    if (app.nsdlRequest) {
       console.log("DATA FOUND IN NSDL REQUEST!");
    } else {
       console.log("NSDL REQUEST IS EMPTY.");
    }

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkNsdlRequest();
