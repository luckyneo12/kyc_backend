const digioClient = require("./digioClient");

/**
 * Selfie & Liveness Verification Service
 */
class SelfieService {
  /**
   * Create a Liveness verification request
   */
  async createRequest(customerIdentifier) {
    const endpoint = "client/kyc/v2/request/with_template";
    
    return await digioClient.post(endpoint, {
      customer_identifier: customerIdentifier,
      template_name: "SELFIE_KYC",
      notify_customer: false,
      generate_access_token: true
    });
  }

  /**
   * Compare two faces (e.g. Selfie vs ID Card)
   */
  async faceMatch(image1, image2) {
    const endpoint = "v3/client/kyc/face/match";
    
    return await digioClient.post(endpoint, {
      image1: image1, // Base64 or URL
      image2: image2,
    });
  }
}

module.exports = new SelfieService();
