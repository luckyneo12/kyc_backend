require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const authRoutes = require("./src/routes/authRoutes");
const kycRoutes = require("./src/routes/kycRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const digioRoutes = require("./src/routes/digioRoutes");
const errorHandler = require("./src/middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Disable CSP for easier dev with multiple ports
}));
app.use(cors());

// Request Body Parser with increased limit for large PDFs
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Request Logging with Body Size
app.use((req, res, next) => {
  const size = req.headers['content-length'] ? (parseInt(req.headers['content-length']) / 1024).toFixed(2) + ' KB' : 'unknown size';
  console.log(`[Incoming Request] ${req.method} ${req.url} - ${size}`);
  next();
});

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Increased limit to prevent blocking during heavy polling
  message: { success: false, error: "Too many requests from this IP, please try again later." }
});
app.use("/api/", limiter);

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/digio", digioRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({ message: "KYC API is running robustly on MySQL" });
});

// Error Handling
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 KYC API Server running on http://localhost:${PORT}`);
  console.log(`   Database: MySQL via Prisma`);
  console.log(`   Security: Helmet, Rate Limiting, Zod Validation\n`);
});
// Server restarted at: 2026-05-01T11:00:00
