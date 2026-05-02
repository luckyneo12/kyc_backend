const crypto = require("crypto");
const prisma = require("../config/db");
const { z } = require("zod");

const STEP_INDEX = {
  welcome: 0,
  phone: 1,
  email: 2,
  pricing: 3,
  pan: 4,
  digilocker: 5,
  details: 6,
  nomineeChoice: 7,
  nominee: 8,
  nomineeAllocation: 9,
  bankVerification: 10,
  financialProof: 11,
  signature: 12,
  panUpload: 13,
  ipv: 14,
  esignPreview: 15,
  aadhaarEsign: 16,
  finalCompletion: 17,
};

const SAFE_PATCH_KEYS = new Set([
  "status",
  "currentStep",
  "personalDetails",
  "identityMethod",
  "identityDetails",
  "ocrData",
  "faceMatchScore",
  "address",
  "bankDetails",
  "nomineeDetails",
  "nomineeAllocation",
  "panUpload",
  "signature",
  "financialProof",
  "selfieDetails",
  "documents",
  "consent",
  "rejectionReason",
  "nsdlResponse",
  "submittedAt",
  "segments",
  "bsda",
  "generatedPdfBase64",
]);

const saveStepSchema = z.object({
  applicationId: z.string(),
  step: z.string().optional().nullable(),
  stepIndex: z.number().optional().nullable(),
  data: z.any().optional().default({})
});

const submitSchema = z.object({
  applicationId: z.string().min(1, "applicationId is required"),
  data: z.record(z.any()).default({}),
});

function generateApplicationId() {
  return (
    "KYC" +
    Date.now().toString(36).toUpperCase() +
    crypto.randomBytes(2).toString("hex").toUpperCase()
  );
}

/**
 * Defensively merges a patch into an existing JSON object.
 * Protects existing non-empty values from being overwritten by empty/null patches.
 * Performs a deep merge for nested objects.
 */
function mergeJson(existing, patch, path = "") {
  if (!patch || (typeof patch === 'object' && Object.keys(patch).length === 0)) return existing || {};
  if (!existing || (typeof existing === 'object' && Object.keys(existing).length === 0)) return patch;

  const result = { ...existing };
  
  Object.keys(patch).forEach(key => {
    const val = patch[key];
    const oldVal = existing[key];
    const currentPath = path ? `${path}.${key}` : key;

    // 1. Recursive merge for nested objects (except arrays)
    if (val && typeof val === 'object' && !Array.isArray(val) &&
        oldVal && typeof oldVal === 'object' && !Array.isArray(oldVal)) {
      result[key] = mergeJson(oldVal, val, currentPath);
      return;
    }

    // 2. Protection for meaningful values
    // If the new value is "empty" (null, undefined, or empty string)
    // but the old value was meaningful, we RETAIN the old value.
    const isEmpty = val === null || val === undefined || (typeof val === "string" && val.trim() === "");
    const wasPopulated = oldVal !== null && oldVal !== undefined && oldVal !== "";

    if (isEmpty && wasPopulated) {
      // console.log(`[mergeJson] Protecting populated field: ${currentPath}`);
      return;
    }

    // 3. Special case for arrays: if the new array is empty but the old was not,
    // we generally want to protect it UNLESS it's an explicit clear.
    if (Array.isArray(val) && val.length === 0 && Array.isArray(oldVal) && oldVal.length > 0) {
      console.log(`[mergeJson] Protecting populated array: ${currentPath}`);
      return;
    }

    // Otherwise, accept the update
    result[key] = val;
  });

  return result;
}


async function writeAuditLog({ userId, action, details, ipAddress }) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details,
        ipAddress,
      },
    });
  } catch (error) {
    console.error("[AuditLog] Failed to persist log:", error.message);
  }
}

const startKyc = async (req, res, next) => {
  try {
    // 1. Check for existing application first
    const existingApp = await prisma.kycApplication.findFirst({
      where: { 
        userId: req.user.id,
        status: { not: "verified" } // Reuse anything not yet verified
      },
      orderBy: { createdAt: "desc" }
    });

    if (existingApp) {
      return res.json({ 
        success: true, 
        applicationId: existingApp.applicationId, 
        id: existingApp.id,
        currentStep: existingApp.currentStep,
        status: existingApp.status,
        isNew: false 
      });
    }

    // 2. Create new only if none exist
    const applicationId = generateApplicationId();
    const application = await prisma.kycApplication.create({
      data: {
        userId: req.user.id,
        applicationId,
        status: "pending",
        currentStep: 1, // Start at Phone step as they just verified it to get here
        bsda: "opt-in",
        segments: { equity: true, derivatives: false }
      },
    });

    await writeAuditLog({
      userId: req.user.id,
      action: "kyc_started",
      details: { applicationId },
      ipAddress: req.ip,
    });

    res.json({ success: true, applicationId: application.applicationId, id: application.id, isNew: true });
  } catch (error) {
    next(error);
  }
};

const getMyApplication = async (req, res, next) => {
  try {
    const app = await prisma.kycApplication.findFirst({
      where: {
        userId: req.user.id,
        status: { in: ["pending", "under_review", "on_hold"] },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!app) {
      return res.json({ success: true, application: null });
    }

    res.json({ success: true, application: app });
  } catch (error) {
    next(error);
  }
};

const saveStep = async (req, res, next) => {
  try {
    const { applicationId, step, stepIndex, data } = req.body || {};
    console.log(`[KYC SaveStep] App: ${applicationId}, Step: ${step}, Index: ${stepIndex}`);
    
    if (!applicationId) {
      return res.status(400).json({ success: false, error: "applicationId is required" });
    }

    const app = await prisma.kycApplication.findUnique({
      where: { applicationId },
    });

    if (!app || app.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: "Application not found for this user" });
    }

    const updateData = {};

    for (const [key, value] of Object.entries(data || {})) {
      if (!SAFE_PATCH_KEYS.has(key) || value === undefined) continue;
      if (key === "currentStep" || key === "faceMatchScore") {
        updateData[key] = Number(value);
        continue;
      }
      if (key === "submittedAt" && value) {
        updateData.submittedAt = new Date(value);
        continue;
      }
      if (["personalDetails", "identityDetails", "ocrData", "address", "bankDetails", "nomineeDetails", "nomineeAllocation", "panUpload", "signature", "financialProof", "selfieDetails", "documents", "nsdlRequest", "nsdlResponse", "segments"].includes(key)) {
        updateData[key] = mergeJson(app[key], value);
        continue;
      }
      updateData[key] = value;
    }

    let candidateStep = stepIndex !== undefined ? parseInt(stepIndex) : STEP_INDEX[step];
    
    if (!isNaN(candidateStep) && candidateStep !== null) {
      const safeStep = Math.max(0, Math.min(25, candidateStep));
      updateData.currentStep = safeStep;
    }

    console.log(`[KYC SaveStep] Saving ${Object.keys(updateData).length} fields for App: ${applicationId}`);

    try {
      await prisma.kycApplication.update({
        where: { applicationId },
        data: updateData,
      });
      console.log(`[KYC SaveStep] Success for App: ${applicationId}`);
    } catch (dbError) {
      console.error("[KYC SaveStep] Prisma Error:", dbError.message);
      return res.status(500).json({ success: false, error: "Database update failed: " + dbError.message });
    }

    await writeAuditLog({
      userId: req.user.id,
      action: "kyc_step_saved",
      details: {
        applicationId,
        step: step || null,
        stepIndex: updateData.currentStep ?? app.currentStep,
        patchedKeys: Object.keys(updateData),
      },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: "Progress saved",
      applicationId,
      currentStep: updateData.currentStep ?? app.currentStep,
    });
  } catch (error) {
    console.error("[KYC SaveStep] Fatal Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const uploadDocument = (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });
  res.json({
    success: true,
    path: `/uploads/${req.file.filename}`,
    filename: req.file.filename,
  });
};

const ocrExtract = (req, res) => {
  const { documentType } = req.body || {};
  const mockData = {
    pan: { name: "AMIT KUMAR MISHRA", dob: "04/08/1997", idNumber: "BOYPP7655B" },
    aadhaar: { name: "Amit Kumar Mishra", dob: "04/08/1997", idNumber: "9876 5432 1098" },
    passport: { name: "AMIT KUMAR MISHRA", dob: "04/08/1997", idNumber: "A1234567" },
    dl: { name: "AMIT KUMAR MISHRA", dob: "04/08/1997", idNumber: "DL-0420110012345" },
  };

  setTimeout(() => {
    res.json({ success: true, data: mockData[documentType] || mockData.pan });
  }, 700);
};

const faceMatch = (req, res) => {
  const score = 87 + Math.floor(Math.random() * 8);
  setTimeout(() => {
    res.json({ success: true, score, passed: score >= 85, liveness: true });
  }, 900);
};

const submitKyc = async (req, res, next) => {
  try {
    const { applicationId, data } = req.body || {};
    
    if (!applicationId) {
      return res.status(400).json({ success: false, error: "applicationId is required" });
    }
    const app = await prisma.kycApplication.findUnique({
      where: { applicationId },
    });

    if (!app || app.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: "Application not found for this user" });
    }

    const clientId = "INS" + Math.floor(Math.random() * 90000000 + 10000000);
    const { buildNSDLPayload } = require("../utils/nsdlHelper");
    const nsdlPayload = buildNSDLPayload(data || {});

    const mergedPersonalDetails = mergeJson(app.personalDetails, data?.personalDetails);
    const mergedIdentityDetails = mergeJson(app.identityDetails, data?.identityDetails);
    const mergedAddress = mergeJson(app.address, data?.address);
    const mergedBankDetails = mergeJson(app.bankDetails, data?.bankDetails);
    const mergedNomineeDetails = mergeJson(app.nomineeDetails, data?.nomineeDetails);
    const mergedDocuments = mergeJson(app.documents, data?.documents);
    const mergedOcrData = mergeJson(app.ocrData, data?.ocrData);

    await prisma.kycApplication.update({
      where: { applicationId },
      data: {
        status: "under_review",
        currentStep: Math.max(Number(app.currentStep || 0), 17),
        submittedAt: new Date(),
        personalDetails: mergedPersonalDetails,
        identityMethod: data?.identityMethod || app.identityMethod,
        identityDetails: mergedIdentityDetails,
        address: mergedAddress,
        bankDetails: mergedBankDetails,
        nomineeDetails: mergedNomineeDetails,
        panUpload: data?.panUpload || app.panUpload,
        signature: data?.signature || app.signature,
        financialProof: data?.financialProof || app.financialProof,
        selfieDetails: data?.selfieDetails || app.selfieDetails,
        documents: mergedDocuments,
        ocrData: mergedOcrData,
        consent: data?.consent ?? app.consent,
        nsdlRequest: nsdlPayload,
        nsdlResponse: {
          clientId,
          status: "02",
          message: "Account Registered",
          submittedAt: new Date().toISOString(),
        },
        segments: data?.segments || app.segments,
        bsda: data?.bsda || app.bsda,
        nomineeAllocation: data?.nomineeAllocation || app.nomineeAllocation,
      },
    });

    await writeAuditLog({
      userId: req.user.id,
      action: "kyc_submitted",
      details: { applicationId, clientId },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      clientId,
      nsdlStatus: "02",
      message: "Account Registered - KYC submitted for review",
    });
  } catch (error) {
    next(error);
  }
};

const getStatus = async (req, res, next) => {
  try {
    const app = await prisma.kycApplication.findUnique({
      where: { applicationId: req.params.applicationId },
      include: {
        reviewer: {
          select: { id: true, email: true, role: true },
        },
      },
    });

    if (!app || app.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: "Application not found" });
    }

    res.json({
      success: true,
      application: app, // Return full object for frontend context sync
      status: app.status,
      currentStep: app.currentStep,
      submittedAt: app.submittedAt,
      reviewedAt: app.reviewedAt,
      reviewedBy: app.reviewer || null,
      rejectionReason: app.rejectionReason || null,
      nsdlResponse: app.nsdlResponse || null,
    });
  } catch (error) {
    next(error);
  }
};

const getPincodeData = (req, res) => {
  const pin = req.params.pin;
  const pinMap = {
    "4": { state: "Maharashtra", city: "Mumbai" },
    "1": { state: "Delhi", city: "New Delhi" },
    "5": { state: "Andhra Pradesh", city: "Hyderabad" },
  };
  const data = pinMap[pin[0]] || { state: "Unknown", city: "Unknown" };
  res.json({ success: true, ...data });
};

const getKycConfig = async (req, res) => {
  try {
    const { DEFAULT_STEPS } = require("../config/kycSteps");
    res.json({ success: true, steps: DEFAULT_STEPS });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch KYC configuration" });
  }
};

module.exports = {
  startKyc,
  getMyApplication,
  saveStep,
  uploadDocument,
  ocrExtract,
  faceMatch,
  submitKyc,
  getStatus,
  getKycConfig,
  getPincodeData,
};
