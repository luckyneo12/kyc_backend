require("dotenv").config({ path: "../.env" });
const nodemailer = require("nodemailer");

// Mocking the emailService logic
const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const mailOptions = {
      from: `"Stockology Securities" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your OTP for KYC Verification",
      text: `Your OTP for KYC verification is ${otp}.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("SUCCESS:", info.messageId);
    return true;
  } catch (error) {
    console.error("FAILED:", error.message);
    throw error;
  }
};

sendOtpEmail("crm@stockologysecurities.com", "123456").catch(() => {});
