const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findUserData() {
  try {
    const user = await prisma.user.findFirst({
      where: { phone: '9876543210' },
      include: {
        kycApplications: true
      }
    });

    if (!user) {
      console.log("User not found");
      return;
    }

    console.log(`User ID: ${user.id}, Phone: ${user.phone}`);
    user.kycApplications.forEach(app => {
      console.log(`\nApp: ${app.applicationId}, Status: ${app.status}`);
      console.log(`Personal:`, JSON.stringify(app.personalDetails, null, 2));
      console.log(`Nominee:`, JSON.stringify(app.nomineeDetails, null, 2));
    });
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

findUserData();
