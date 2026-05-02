const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const phone = '8789855970';
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    console.log("User not found");
    process.exit(0);
  }
  
  const app = await prisma.kycApplication.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });
  
  console.log(JSON.stringify(app, null, 2));
  process.exit(0);
}

check();
