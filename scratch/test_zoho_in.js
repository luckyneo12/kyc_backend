const nodemailer = require("nodemailer");

const testMail = async (host) => {
  console.log(`Testing ${host}...`);
  const transporter = nodemailer.createTransport({
    host: host,
    port: 465,
    secure: true,
    auth: {
      user: "crm@stockologysecurities.com",
      pass: "zYjuZaBdWKfk",
    }
  });

  try {
    const info = await transporter.sendMail({
      from: `"Stockology Securities" <crm@stockologysecurities.com>`,
      to: "crm@stockologysecurities.com",
      subject: "Test OTP Email",
      text: "This is a test email.",
    });
    console.log(`SUCCESS with ${host}`);
    return true;
  } catch (error) {
    console.error(`FAILED with ${host}:`, error.message);
    return false;
  }
};

const run = async () => {
  await testMail("smtp.zoho.in");
  await testMail("smtppro.zoho.in");
};

run();
