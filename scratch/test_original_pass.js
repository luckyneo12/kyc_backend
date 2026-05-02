const nodemailer = require("nodemailer");

const testMail = async () => {
  const transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    auth: {
      user: "crm@stockologysecurities.com",
      pass: "Crm#$2026",
    }
  });

  try {
    const info = await transporter.sendMail({
      from: `"Stockology Securities" <crm@stockologysecurities.com>`,
      to: "crm@stockologysecurities.com",
      subject: "Test OTP Email",
      text: "This is a test email.",
    });
    console.log("SUCCESS with original password");
    return true;
  } catch (error) {
    console.error("FAILED with original password:", error.message);
    return false;
  }
};

testMail();
