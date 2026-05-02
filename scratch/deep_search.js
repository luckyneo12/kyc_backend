const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deepSearch() {
  try {
    console.log("Searching for 'VIVEK' or 'KUMAR' in all AuditLog details...");
    
    // We fetch all logs and filter in JS for maximum flexibility
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" }
    });

    console.log(`Checking ${logs.length} logs...`);

    let found = false;
    for (const log of logs) {
      const detailsStr = JSON.stringify(log.details || {});
      if (detailsStr.toUpperCase().includes("VIVEK") || detailsStr.toUpperCase().includes("KUMAR")) {
        console.log(`\n!!! MATCH FOUND !!!`);
        console.log(`Action: ${log.action}`);
        console.log(`Timestamp: ${log.timestamp}`);
        console.log(`Details:`, JSON.stringify(log.details, null, 2));
        found = true;
      }
    }

    if (!found) {
      console.log("\nNo matches found in AuditLogs.");
    }

    // Also check all applications just in case
    const apps = await prisma.kycApplication.findMany();
    console.log(`\nChecking ${apps.length} applications for 'VIVEK'...`);
    for (const app of apps) {
      const appStr = JSON.stringify(app);
      if (appStr.toUpperCase().includes("VIVEK") || appStr.toUpperCase().includes("KUMAR")) {
        console.log(`\n!!! MATCH FOUND IN APPLICATION !!!`);
        console.log(`AppId: ${app.applicationId}`);
        console.log(`Status: ${app.status}`);
        console.log(`PersonalDetails:`, JSON.stringify(app.personalDetails, null, 2));
        console.log(`IdentityDetails:`, JSON.stringify(app.identityDetails, null, 2));
      }
    }

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

deepSearch();
