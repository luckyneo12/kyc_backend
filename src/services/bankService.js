const digioClient = require("./digioClient");
const crypto = require("crypto");

/**
 * Bank Account Verification Service (Penny Drop)
 */
class BankService {
  /**
   * Verify bank account using Penny Drop (v4)
   */
  async verifyAccount(accountNumber, ifsc, beneficiaryName) {
    const endpoint = "v4/client/verify/bank_account";
    const uniqueId = `BANK_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    
    return await digioClient.post(endpoint, {
      amount: 1,
      beneficiary_account_no: accountNumber,
      beneficiary_ifsc: ifsc,
      beneficiary_name: beneficiaryName,
      unique_request_id: uniqueId,
      validation_mode: "PENNY_DROP"
    });
  }

  /**
   * Verify IFSC Code (v3)
   */
  async verifyIfsc(ifscCode) {
    const endpoint = "v3/client/kyc/verify/IFSC";
    return await digioClient.post(endpoint, {
      identifier: ifscCode
    });
  }

  /**
   * Create Digio Request for Bank Verification flow
   */
  async createRequest(customerIdentifier, accountNumber, ifsc) {
    // Note: v2 request with template might still be used for SDK-based flow
    const endpoint = "client/kyc/v2/request/with_template";
    
    return await digioClient.post(endpoint, {
      template_name: "BANK_VERIFICATION_TEMPLATE", 
      notify_customer: false,
      generate_access_token: true,
      customer_identifier: customerIdentifier,
      actions: [
        {
          type: "PENNY_DROP",
          title: "Bank Account Verification",
          description: "Verify your bank account via penny drop",
          details: {
            account_number: accountNumber,
            ifsc
          }
        }
      ]
    });
  }
}

module.exports = new BankService();
