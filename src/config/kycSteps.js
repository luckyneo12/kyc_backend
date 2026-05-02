const DEFAULT_STEPS = [
  { id: "welcome", label: "Welcome", isOptional: false },
  { id: "phoneVerification", label: "Phone", isOptional: false },
  { id: "emailVerification", label: "Email", isOptional: false },
  { id: "pricingSelection", label: "Pricing", isOptional: false },
  { id: "panVerification", label: "PAN", isOptional: false },
  { id: "digilocker", label: "DigiLocker", isOptional: false },
  { id: "personalDetails", label: "Personal Details", isOptional: false },
  { id: "nomineeChoice", label: "Nominee Choice", isOptional: false },
  { id: "nomineeDetails", label: "Nominee", isOptional: true },
  { id: "nomineeAllocation", label: "Allocation", isOptional: true },
  { id: "bankVerification", label: "Bank", isOptional: false },
  { id: "financialProof", label: "Financial Proof", isOptional: true },
  { id: "signature", label: "Signature", isOptional: false },
  { id: "panUpload", label: "PAN Upload", isOptional: false },
  { id: "ipv", label: "IPV", isOptional: false },
  { id: "esignPreview", label: "eSign Preview", isOptional: false },
  { id: "aadhaarEsign", label: "Aadhaar eSign", isOptional: false },
  { id: "completion", label: "Completion", isOptional: false },
];

module.exports = { DEFAULT_STEPS };
