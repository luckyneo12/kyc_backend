const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function manualUpdate() {
  const phone = '8789855970';
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    console.log("User not found");
    process.exit(0);
  }
  const app = await prisma.kycApplication.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
  
  console.log("Before Update - Step:", app.currentStep);
  
  await prisma.kycApplication.update({
    where: { id: app.id },
    data: { currentStep: 7 }
  });
  
  const updatedApp = await prisma.kycApplication.findUnique({ where: { id: app.id } });
  console.log("After Update - Step:", updatedApp.currentStep);
  process.exit(0);
}

manualUpdate();
