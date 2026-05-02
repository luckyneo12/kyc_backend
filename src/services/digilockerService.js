const digioClient = require("./digioClient");

/**
 * DigiLocker Integration Service
 */
class DigilockerService {
  /**
   * Create a DigiLocker request for fetching documents
   */
  async createRequest(customerIdentifier, aadhaar, documentTypes = ["AADHAAR", "PAN"], customerName = "") {
    const endpoint = "client/kyc/v2/request/with_template";

    return await digioClient.post(endpoint, {
      customer_identifier: customerIdentifier,
      customer_name: customerName || "KYC User",
      template_name: "DIGILOCKER_AADHAAR_PAN",
      notify_customer: false,
      generate_access_token: true,
      digilocker_document_attributes: {
        "AADHAAR": { "mandatory": "true", "auto_select": "true" },
        "PAN": { "mandatory": "true", "auto_select": "true" }
      }
    });
  }

  /**
   * Get documents fetched from DigiLocker for a request
   */
  async getDocuments(requestId) {
    return await digioClient.getKycRequestResponse(requestId);
  }
}

module.exports = new DigilockerService();
