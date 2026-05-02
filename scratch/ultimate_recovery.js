const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config();
const digioClient = require('../src/services/digioClient');

async function ultimateRecovery() {
  const appId = "KYCMOL2WDR6A17E";
  const requestId = "KID260430113532881AUPCC9K2WMXKZZ";

  try {
    console.log(`Re-fetching DigiO response for requestId: ${requestId}...`);
    const digioResponse = await digioClient.getKycRequestResponse(requestId);
    
    // --- DEEP SCAN EXTRACTION ENGINE (Copied from digioRoutes.js) ---
    const findValue = (obj, targetKey) => {
      if (!obj || typeof obj !== "object") return null;
      if (obj[targetKey]) return obj[targetKey];
      for (const key in obj) {
        const val = findValue(obj[key], targetKey);
        if (val) return val;
      }
      return null;
    };

    let nextIdentityDetails = {};
    let nextPersonalDetails = {};
    let nextAddress = {};

    // Scan for Identity
    const extractedAadhaar = findValue(digioResponse, "aadhaar_no") || findValue(digioResponse, "id_number") || findValue(digioResponse, "id_no");
    const extractedName = findValue(digioResponse, "name") || findValue(digioResponse, "full_name");
    const extractedDob = findValue(digioResponse, "dob") || findValue(digioResponse, "date_of_birth");
    const extractedGender = findValue(digioResponse, "gender");

    if (extractedAadhaar) nextIdentityDetails.aadhaar = extractedAadhaar;
    if (extractedName) nextPersonalDetails.fullName = extractedName;
    if (extractedDob) nextPersonalDetails.dob = extractedDob;
    if (extractedGender) nextPersonalDetails.gender = extractedGender;

    // Scan for Father/Spouse Name
    const relativeName = findValue(digioResponse, "father_name") || findValue(digioResponse, "spouse_name") || findValue(digioResponse, "care_of") || findValue(digioResponse, "relative_name") || findValue(digioResponse, "co");
    if (relativeName) {
      const cleanRelative = relativeName.replace(/^(S\/O|W\/O|D\/O|C\/O|CO|SO|CARE OF)[:\s]+/i, "").trim();
      nextPersonalDetails.fatherName = cleanRelative;
    }

    // Scan for Address
    const house = findValue(digioResponse, "house_no") || findValue(digioResponse, "house");
    const street = findValue(digioResponse, "street");
    const landmark = findValue(digioResponse, "landmark");
    const loc = findValue(digioResponse, "loc") || findValue(digioResponse, "location");
    const city = findValue(digioResponse, "city") || findValue(digioResponse, "vtc") || findValue(digioResponse, "district_or_city");
    const dist = findValue(digioResponse, "dist") || findValue(digioResponse, "district") || findValue(digioResponse, "district_or_city");
    const state = findValue(digioResponse, "state");
    const pc = findValue(digioResponse, "pc") || findValue(digioResponse, "pincode");

    if (house || street) {
       nextAddress.line1 = [house, street].filter(Boolean).join(", ");
       nextAddress.city = city || dist;
       nextAddress.state = state;
       nextAddress.pincode = pc;
    }

    console.log("RECOVERED DATA:");
    console.log("Personal:", JSON.stringify(nextPersonalDetails, null, 2));
    console.log("Identity:", JSON.stringify(nextIdentityDetails, null, 2));
    console.log("Address:", JSON.stringify(nextAddress, null, 2));

    // Update the database
    const app = await prisma.kycApplication.findUnique({ where: { applicationId: appId } });
    
    await prisma.kycApplication.update({
      where: { applicationId: appId },
      data: {
        personalDetails: { ...(app.personalDetails || {}), ...nextPersonalDetails },
        identityDetails: { ...(app.identityDetails || {}), ...nextIdentityDetails },
        address: { ...(app.address || {}), ...nextAddress },
        status: "under_review"
      }
    });

    console.log("\nSUCCESS! Application KYCMOL2WDR6A17E has been fully restored with DigiO data.");

  } catch (e) {
    console.error("Recovery Failed:", e.response?.data || e.message);
  } finally {
    await prisma.$disconnect();
  }
}

ultimateRecovery();
