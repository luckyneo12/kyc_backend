const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const clientId = process.env.DIGIO_CLIENT_ID;
const clientSecret = process.env.DIGIO_CLIENT_SECRET;

const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

const endpoints = [
  'v2/client/kyc/request',
  'v3/client/kyc/request',
  'client/kyc/v3/request',
  'v3/client/request',
  'kyc/v3/request',
  'v3/client/kyc/v2/request',
  'v2/client/kyc/v3/request'
];

async function testEndpoints() {
  for (const ep of endpoints) {
    try {
      console.log(`Testing: ${ep}`);
      const response = await axios.post(`https://api.digio.in/${ep}`, {
        customer_identifier: "test@example.com",
        template_name: "DIGILOCKER_AADHAAR_PAN"
      }, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ SUCCESS: ${ep} -> ${response.status}`);
      process.exit(0);
    } catch (error) {
      console.log(`❌ FAILED: ${ep} -> ${error.response?.status || error.message} (${error.response?.data?.code})`);
    }
  }
}

testEndpoints();
