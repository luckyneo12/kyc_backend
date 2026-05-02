const axios = require("axios");

/**
 * Airtel IQ SMS Service
 * Handles sending OTPs via Airtel IQ API with DLT template compliance.
 */

const SMS_CONFIG = {
  url: "https://iqmessaging.airtel.in/api/v4/send-sms",
  authorization: process.env.SMS_AUTH,
  customerId: process.env.SMS_CUSTOMER_ID_HEADER,
  bodyCustomerId: process.env.SMS_CUSTOMER_ID_BODY,
  entityId: process.env.SMS_ENTITY_ID,
  sourceAddress: process.env.SMS_SOURCE_ADDRESS,
  templateId: process.env.SMS_TEMPLATE_ID
};


/**
 * Sends a Mobile Verification OTP via Airtel IQ
 * @param {string} phone - 10-digit mobile number
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<object>} - API response
 */
const sendMobileOtp = async (phone, otp) => {
  try {
    // Reference number for the template (e.g., STOCKOLOGY or current timestamp)
    const refNo = "KYC-" + Date.now().toString().slice(-6);
    
    // The template: "Dear Sir/Madam, Your OTP For Mobile Verification at Stockology Securities Pvt. Ltd. is {#var#} With Respect to Token/Ref. No {#var#} From. -STOCKOLOGY"
    // We replace {#var#} by placing the values in order. 
    // NOTE: Airtel IQ might require the full message with values replaced.
    const message = `Dear Sir/Madam, Your OTP For Mobile Verification at Stockology Securities Pvt. Ltd. is ${otp} With Respect to Token/Ref. No ${refNo} From. -STOCKOLOGY`;

    const payload = {
      customerId: SMS_CONFIG.bodyCustomerId,
      destinationAddress: [phone],
      message: message,
      sourceAddress: SMS_CONFIG.sourceAddress,
      messageType: "SERVICE_IMPLICIT",
      dltTemplateId: SMS_CONFIG.templateId,
      entityId: SMS_CONFIG.entityId,
      otp: true
    };

    console.log(`[SMS Service] Sending OTP to ${phone}: ${otp}`);

    const response = await axios.post(SMS_CONFIG.url, payload, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": SMS_CONFIG.authorization,
        "customerId": SMS_CONFIG.customerId
      }
    });

    console.log(`[SMS Service] Success:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[SMS Service] Error:`, error.response?.data || error.message);
    throw new Error("Failed to send SMS OTP");
  }
};

module.exports = { sendMobileOtp };
