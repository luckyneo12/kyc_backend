const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const phone = '8789855970';
  console.log(`Checking status for ${phone}...`);
  
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    console.log("User not found");
    process.exit(0);
  }
  
  const apps = await prisma.kycApplication.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });
  
  console.log(`Found ${apps.length} applications`);
  apps.forEach(app => {
    console.log(`ID: ${app.applicationId}, Step: ${app.currentStep}, Status: ${app.status}, Created: ${app.createdAt}`);
  });
  
  process.exit(0);
}

check();
