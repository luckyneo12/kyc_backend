const axios = require("axios");

/**
 * Digio Client for Backend API calls
 */
class DigioClient {
  constructor() {
    this.baseUrl = process.env.DIGIO_BASE_URL || "https://api.digio.in/";
    // Ensure base URL ends with a slash for consistency if needed, 
    // or handle it in the post/get methods.
    if (!this.baseUrl.endsWith('/')) {
      this.baseUrl += '/';
    }
    
    this.clientId = process.env.DIGIO_CLIENT_ID;
    this.clientSecret = process.env.DIGIO_CLIENT_SECRET;
    
    // Auth header (Basic Auth)
    this.auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
    this.http = axios.create({
      baseURL: this.baseUrl,
      timeout: 20000,
      headers: {
        "Authorization": `Basic ${this.auth}`,
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Set credentials dynamically (matching PHP implementation)
   */
  setCredentials(clientId, clientSecret, environment = 'sandbox') {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.environment = environment;
    this.baseUrl = this.environment === 'production'
        ? 'https://api.digio.in/'
        : 'https://ext.digio.in/';

    this.auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
    
    this.http = axios.create({
      baseURL: this.baseUrl,
      timeout: 20000,
      headers: {
        "Authorization": `Basic ${this.auth}`,
        "Content-Type": "application/json",
      },
    });
    
    return this;
  }

  async post(endpoint, data = {}, config = {}) {
    const fullUrl = `${this.http.defaults.baseURL}${endpoint}`;
    console.log(`[Digio API Request] POST ${fullUrl}`);
    try {
      const response = await this.http.post(endpoint, data, config);
      return response.data;
    } catch (error) {
      console.error(`Digio API Error [POST ${endpoint}]:`, error.response?.data || error.message);
      throw error;
    }
  }

  async get(endpoint) {
    const fullUrl = `${this.http.defaults.baseURL}${endpoint}`;
    console.log(`[Digio API Request] GET ${fullUrl}`);
    try {
      const response = await this.http.get(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Digio API Error [GET ${endpoint}]:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Fetches full KYC request state and action results.
   */
  async getKycRequestResponse(requestId) {
    return this.post(`client/kyc/v2/${requestId}/response`, {});
  }

  /**
   * Downloads the document associated with a KYC request.
   */
  async downloadKycDocument(requestId) {
    return this.http.get(`client/kyc/v2/${requestId}/download`, {
      responseType: 'arraybuffer'
    });
  }
}

module.exports = new DigioClient();
