const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function recoverData() {
  const appId = "KYCMOL2WDR6A17E";
  try {
    // 1. Get the app to find the userId
    const app = await prisma.kycApplication.findUnique({
      where: { applicationId: appId },
    });
    
    if (!app) {
      console.log("App not found");
      return;
    }

    console.log("Searching for data in AuditLogs for userId:", app.userId);

    // 2. Search AuditLogs for any data-rich actions
    const logs = await prisma.auditLog.findMany({
      where: { 
        userId: app.userId,
        action: { in: ["save_step", "kyc_step_saved", "digio_response_fetched"] }
      },
      orderBy: { timestamp: "desc" }
    });

    console.log(`Found ${logs.length} logs. Searching for most complete data...`);

    let bestPersonal = null;
    let bestIdentity = null;
    let bestAddress = null;
    let bestBank = null;

    for (const log of logs) {
      if (log.details && log.details.applicationId === appId) {
        const data = log.details.data || {};
        
        // Check for personalDetails
        if (data.personalDetails && Object.keys(data.personalDetails).filter(k => data.personalDetails[k]).length > (bestPersonal ? Object.keys(bestPersonal).filter(k => bestPersonal[k]).length : 0)) {
           if (data.personalDetails.fullName || data.personalDetails.fatherName) {
             bestPersonal = data.personalDetails;
             console.log(`[Recovery] Found better PersonalDetails at ${log.timestamp}`);
           }
        }

        // Check for identityDetails
        if (data.identityDetails && Object.keys(data.identityDetails).filter(k => data.identityDetails[k]).length > (bestIdentity ? Object.keys(bestIdentity).filter(k => bestIdentity[k]).length : 0)) {
           if (data.identityDetails.pan || data.identityDetails.aadhaar) {
             bestIdentity = data.identityDetails;
             console.log(`[Recovery] Found better IdentityDetails at ${log.timestamp}`);
           }
        }

        // Check for address
        if (data.address && Object.keys(data.address).filter(k => data.address[k]).length > (bestAddress ? Object.keys(bestAddress).filter(k => bestAddress[k]).length : 0)) {
           bestAddress = data.address;
           console.log(`[Recovery] Found better Address at ${log.timestamp}`);
        }

        // Check for bankDetails
        if (data.bankDetails && Object.keys(data.bankDetails).filter(k => data.bankDetails[k]).length > (bestBank ? Object.keys(bestBank).filter(k => bestBank[k]).length : 0)) {
           bestBank = data.bankDetails;
           console.log(`[Recovery] Found better BankDetails at ${log.timestamp}`);
        }
      }
    }

    if (bestPersonal || bestIdentity || bestAddress || bestBank) {
      console.log("\n--- RECOVERY PLAN ---");
      console.log("Personal:", JSON.stringify(bestPersonal, null, 2));
      console.log("Identity:", JSON.stringify(bestIdentity, null, 2));
      console.log("Address:", JSON.stringify(bestAddress, null, 2));
      console.log("Bank:", JSON.stringify(bestBank, null, 2));

      // 4. Update the application with recovered data!
      const updateResult = await prisma.kycApplication.update({
        where: { applicationId: appId },
        data: {
          personalDetails: bestPersonal || app.personalDetails,
          identityDetails: bestIdentity || app.identityDetails,
          address: bestAddress || app.address,
          bankDetails: bestBank || app.bankDetails
        }
      });
      console.log("\nSUCCESS: Restored data for", appId);
    } else {
      console.log("\nNo complete data found in logs.");
    }

    // 3. Check if there's ANOTHER application for this user that might have data
    const otherApps = await prisma.kycApplication.findMany({
      where: { 
        userId: app.userId,
        applicationId: { not: appId }
      }
    });
    
    if (otherApps.length > 0) {
      console.log("\nFOUND OTHER APPLICATIONS FOR THIS USER:");
      for (const other of otherApps) {
        console.log(`ID: ${other.applicationId}, Status: ${other.status}, Data:`, JSON.stringify(other.personalDetails, null, 2));
      }
    }

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

recoverData();
