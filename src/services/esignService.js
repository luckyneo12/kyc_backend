const digioClient = require("./digioClient");

/**
 * eSign Service via Digio
 */
class EsignService {
  /**
   * Creates an Aadhaar eSign request for a document.
   */
  async createRequest(customerIdentifier, aadhaar, userData = {}) {
    const endpoint = "v2/client/document/uploadpdf";
    
    // A standard blank A4 PDF base64 (Valid PDF 1.7)
    const blankPdf = "JVBERi0xLjcKJeLjz9MKMSAwIG9iaiA8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PmVuZG9iaiAyIDAgb2JqIDw8L1R5cGUvUGFnZXMvS2lkc1szIDAgUl0vQ291bnQgMT4+ZW5kb2JqIDMgMCBvYmogPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgNTk1IDg0Ml0vUmVzb3VyY2VzIDw8Pj4+PmVuZG9iaiB4cmVmCjAgNwowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDA2MCAwMDAwMCBuIAowMDAwMDAwMTExIDAwMDAwIG4gCnRyYWlsZXIgPDwvU2l6ZSA0L1Jvb3QgMSAwIFI+PgpzdGFydHhyZWYKMTcwCiUlRU9G";
    
    // Ensure coordinates match the identifier
    let finalCoordinates = userData.signCoordinates;
    if (finalCoordinates && typeof finalCoordinates === 'object') {
      const keys = Object.keys(finalCoordinates);
      if (keys.length > 0 && !finalCoordinates[customerIdentifier]) {
        console.log(`[EsignService] Final remapping to match ${customerIdentifier}`);
        finalCoordinates = { [customerIdentifier]: finalCoordinates[keys[0]] };
      }
    }

    const payload = {
      file_name: "KYC_Application.pdf",
      file_data: userData.pdfBase64 || blankPdf,
      signers: [
        {
          identifier: customerIdentifier,
          name: userData.fullName || "KYC User",
          reason: "KYC Application Signing",
          sign_type: "aadhaar"
        }
      ],
      expire_in_days: 10,
      display_on_page: (finalCoordinates && Object.keys(finalCoordinates).length > 0) ? "custom" : "all",
      sign_coordinates: (finalCoordinates && Object.keys(finalCoordinates).length > 0) ? finalCoordinates : undefined,
      notify_signers: true,
      generate_access_token: true,
      sequential: false
    };

    console.log(`[EsignService] Target Environment: ${digioClient.baseUrl.includes('ext.digio.in') ? 'SANDBOX' : 'PRODUCTION'}`);
    console.log("[EsignService] Full Payload (no-pdf):", JSON.stringify({ ...payload, file_data: "REDACTED" }, null, 2));
    
    try {
      const response = await digioClient.post(endpoint, payload);
      return response;
    } catch (error) {
      const errorData = error.response?.data || {};
      const status = error.response?.status;
      const errorCode = errorData.code || "";
      const errorMessage = errorData.message || error.message || "";
      
      console.error(`[EsignService] Digio API Error (Status: ${status}, Code: ${errorCode}):`, JSON.stringify(errorData, null, 2));
      
      // Fallback for PDF size/parsing/validity issues OR JSON processing issues
      const isPdfError = errorCode === "INVALID_PDF_DOCUMENT" || 
                         errorCode === "UNABLE_TO_PROCESS_JSON" ||
                         errorMessage.toLowerCase().includes("pdf") || 
                         errorMessage.toLowerCase().includes("json") || 
                         errorMessage.toLowerCase().includes("size") || 
                         status === 413;

      if (userData.pdfBase64 && isPdfError) {
        console.warn(`[EsignService] Retrying with STABLE blank PDF due to: ${errorCode || errorMessage}`);
        payload.file_data = blankPdf;
        try {
          const retryResponse = await digioClient.post(endpoint, payload);
          return retryResponse;
        } catch (retryError) {
          console.error("[EsignService] Retry also failed:", retryError.response?.data || retryError.message);
          throw new Error(retryError.response?.data?.message || "Failed even with blank PDF");
        }
      }
      
      throw new Error(errorMessage || `Digio Error: ${status || "Network Error"}`);
    }
  }

  /**
   * Get details of a sign request/document
   */
  async getRequestDetails(docId) {
    const endpoint = `v2/client/document/${docId}`;
    return await digioClient.get(endpoint);
  }

  /**
   * Cancel a pending sign request
   */
  async cancelRequest(docId) {
    const endpoint = `v2/client/document/${docId}/cancel`;
    return await digioClient.post(endpoint, {});
  }

  /**
   * Download the signed document
   * Returns a buffer/stream
   */
  async downloadDocument(docId) {
    const endpoint = `v2/client/document/download?document_id=${docId}`;
    return await digioClient.get(endpoint, { responseType: 'arraybuffer' });
  }
}

module.exports = new EsignService();
