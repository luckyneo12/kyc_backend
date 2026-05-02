const express = require("express");
const {
  getApplications,
  getApplicationById,
  reviewApplication,
  deleteApplication,
  getStats,
  getAuditLogs
} = require("../controllers/adminController");
const { adminAuth } = require("../middlewares/auth");

const router = express.Router();

router.get("/applications", adminAuth, getApplications);
router.get("/application/:id", adminAuth, getApplicationById);
router.put("/review/:id", adminAuth, reviewApplication);
router.delete("/application/:id", adminAuth, deleteApplication);
router.get("/stats", adminAuth, getStats);
router.get("/audit-logs", adminAuth, getAuditLogs);

module.exports = router;
