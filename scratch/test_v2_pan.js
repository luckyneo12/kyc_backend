const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const clientId = process.env.DIGIO_CLIENT_ID;
const clientSecret = process.env.DIGIO_CLIENT_SECRET;
const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

async function testV2Pan() {
  try {
    const response = await axios.post(`https://api.digio.in/v2/client/kyc/fetch_id_data/PAN`, {
      id_no: "JRRPK4256H",
      name: "VIVEK KUMAR",
      dob: "15/09/2001"
    }, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`✅ V2 PAN SUCCESS: ${response.status}`);
  } catch (error) {
    console.log(`❌ V2 PAN FAILED: ${error.response?.status || error.message} (${error.response?.data?.code})`);
  }
}

testV2Pan();
