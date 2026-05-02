const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fullRestoration() {
  const appId = "KYCMOL2WDR6A17E";
  
  const fullData = {
    personalDetails: {
      fullName: "Vivek Kumar",
      fatherName: "Binod Kumar",
      dob: "15/09/2001",
      email: "vampirevivek474@gmail.com",
      gender: "Male",
      maritalStatus: "Single",
      education: "Graduate",
      annualIncome: "1L - 5L",
      occupation: "Public Sector",
      politicallyExposed: "No",
      isIndianCitizen: "Yes",
      taxResidencyOutside: "No",
      ddpi: "Yes",
      transferSecurities: true,
      pledgeSecurities: true,
      mfTransactions: true,
      tenderingShares: true,
      dis: "No",
      receiveCredits: "Yes",
      eStatement: "Yes",
      acceptPledgeInstructions: "No",
      receiveAnnualReports: "Yes",
      settlement: "Quarterly",
      smsAlert: "Yes",
      operatedThroughDDPI: "Yes"
    },
    address: {
      line1: "Q No-1055, SectoR-8/B, Street-15",
      line2: "Post Office- SectoR-9, Bokaro Steel City, Chas",
      city: "Bokaro",
      state: "Jharkhand",
      pincode: "827009",
      country: "India",
      useAadhaar: true
    },
    segments: { equity: true, derivatives: false },
    bsda: "opt-in",
    currentStep: 17,
    status: "under_review"
  };

  try {
    const updated = await prisma.kycApplication.update({
      where: { applicationId: appId },
      data: fullData
    });

    console.log("SUCCESS! Full Data Restoration Complete for", appId);
    console.log("Restored Fields: Name, Father's Name, Address, Segments, Pincode, Regulatory Details.");
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

fullRestoration();
