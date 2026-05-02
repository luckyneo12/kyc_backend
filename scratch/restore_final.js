const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function restoreData() {
  const appId = "KYCMOL2WDR6A17E";
  const recoveredData = {
    personalDetails: {
      fullName: "Vivek Kumar",
      email: "vivekrajj474@gmail.com",
      dob: "2001-09-15",
      gender: "Male" // Common assumption but better than N/A
    },
    identityDetails: {
      pan: "JRRPK4256H",
      pan_name: "VIVEK KUMAR",
      identityMethod: "DIGILOCKER"
    },
    // We keep existing status/step
  };

  try {
    const app = await prisma.kycApplication.findUnique({ where: { applicationId: appId } });
    if (!app) {
      console.log("App not found");
      return;
    }

    const updated = await prisma.kycApplication.update({
      where: { applicationId: appId },
      data: {
        personalDetails: { ...(app.personalDetails || {}), ...recoveredData.personalDetails },
        identityDetails: { ...(app.identityDetails || {}), ...recoveredData.identityDetails },
        status: "under_review" // Move to under_review so it's easier to find in admin
      }
    });

    console.log("SUCCESS! Restored data for", appId);
    console.log("Updated Application:", JSON.stringify(updated.personalDetails, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

restoreData();
