const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.kycApplication.count();
  console.log('Total KYC Applications:', count);
  
  const apps = await prisma.kycApplication.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: {
      applicationId: true,
      userId: true,
      status: true,
      currentStep: true,
      user: { select: { phone: true } }
    }
  });
  console.log('Latest 10 Apps:', JSON.stringify(apps, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
