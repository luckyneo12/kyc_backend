const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanOrphans() {
  try {
    console.log("Looking for orphaned KYC Applications...");
    // Find all users
    const users = await prisma.user.findMany({ select: { id: true } });
    const userIds = users.map(u => u.id);

    // Find all KYC Applications
    const apps = await prisma.kycApplication.findMany();
    
    let deletedCount = 0;
    for (const app of apps) {
      if (!userIds.includes(app.userId)) {
        console.log(`Deleting orphaned app with ID: ${app.id} (linked to deleted user ${app.userId})`);
        await prisma.kycApplication.delete({ where: { id: app.id } });
        deletedCount++;
      }
    }
    
    console.log(`Successfully deleted ${deletedCount} orphaned KYC Applications.`);
  } catch (error) {
    console.error("Error cleaning orphans:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanOrphans();
