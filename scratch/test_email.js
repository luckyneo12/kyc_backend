require("dotenv").config({ path: "../.env" });
const nodemailer = require("nodemailer");

const testMail = async (host, port, secure) => {
  console.log(`Testing ${host}:${port} (secure: ${secure})...`);
  const transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    debug: true,
    logger: true
  });

  try {
    const info = await transporter.sendMail({
      from: `"Stockology Securities" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: "Test OTP Email",
      text: "This is a test email.",
    });
    console.log(`SUCCESS with ${host}:${port}`);
    return true;
  } catch (error) {
    console.error(`FAILED with ${host}:${port}:`, error.message);
    return false;
  }
};

const runTests = async () => {
  const configs = [
    { host: "smtp.zoho.com", port: 465, secure: true },
    { host: "smtp.zoho.com", port: 587, secure: false },
    { host: "smtppro.zoho.com", port: 465, secure: true },
    { host: "smtppro.zoho.com", port: 587, secure: false },
  ];

  for (const config of configs) {
    const success = await testMail(config.host, config.port, config.secure);
    if (success) break;
  }
};

runTests();
