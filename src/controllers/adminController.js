const prisma = require("../config/db");
const { z } = require("zod");

const reviewSchema = z.object({
  status: z.enum(["pending", "under_review", "verified", "rejected", "on_hold"]),
  reason: z.string().optional().default(""),
  currentStep: z.number().int().min(0).max(50).optional(),
});

const getApplications = async (req, res, next) => {
  const { status, search = "", page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const take = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 200);
  const skip = (pageNum - 1) * take;

  try {
    const where = {};
    const normalizedStatus = String(status || "").toLowerCase();
    if (normalizedStatus && normalizedStatus !== "all") {
      where.status = normalizedStatus;
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { applicationId: { contains: q } },
        { user: { phone: { contains: q } } },
        { user: { email: { contains: q } } },
        { personalDetails: { path: ["fullName"], string_contains: q } }
      ];
    }

    // Optimization: Only fetch fields needed for the list view
    const [applications, total] = await Promise.all([
      prisma.kycApplication.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        take,
        skip,
        select: {
          id: true,
          applicationId: true,
          status: true,
          currentStep: true,
          updatedAt: true,
          createdAt: true,
          personalDetails: true, // Needed for name
          identityDetails: true, // Needed for PAN/Aadhaar status
          user: {
            select: {
              id: true,
              phone: true,
              email: true
            }
          }
        }
      }),
      prisma.kycApplication.count({ where })
    ]);

    res.json({
      success: true,
      applications,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    next(error);
  }
};

const getApplicationById = async (req, res, next) => {
  try {
    const app = await prisma.kycApplication.findUnique({
      where: { applicationId: req.params.id },
      include: {
        user: true,
        reviewer: true,
      },
    });

    if (!app) return res.status(404).json({ success: false, error: "Not found" });

    const allLogs = await prisma.auditLog.findMany({
      where: { userId: app.userId },
      orderBy: { timestamp: "desc" },
      take: 500,
    });

    const logs = allLogs.filter((log) => {
      const linkedAppId = log.details?.applicationId;
      return !linkedAppId || linkedAppId === app.applicationId;
    });

    res.json({ success: true, application: app, logs });
  } catch (error) {
    next(error);
  }
};

const reviewApplication = async (req, res, next) => {
  let payload;
  try {
    payload = reviewSchema.parse(req.body || {});
  } catch (error) {
    return res.status(400).json({ success: false, error: error.errors?.[0]?.message || "Invalid review payload" });
  }

  const { status, reason, currentStep } = payload;
  try {
    const app = await prisma.kycApplication.findUnique({
      where: { applicationId: req.params.id },
    });
    if (!app) {
      return res.status(404).json({ success: false, error: "Application not found" });
    }

    const updateData = {
      status,
      rejectionReason: reason || null,
      reviewedAt: new Date(),
      reviewedBy: req.user.id,
    };

    if (currentStep !== undefined) {
      updateData.currentStep = currentStep;
    }

    await prisma.kycApplication.update({
      where: { applicationId: req.params.id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: `kyc_${status}`,
        details: { applicationId: req.params.id, reason: reason || null, currentStep },
        ipAddress: req.ip,
      },
    });

    res.json({ success: true, message: `Application ${status}` });
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const [total, pending, review, verified, rejected, onHold, recent] = await Promise.all([
      prisma.kycApplication.count(),
      prisma.kycApplication.count({ where: { status: "pending" } }),
      prisma.kycApplication.count({ where: { status: "under_review" } }),
      prisma.kycApplication.count({ where: { status: "verified" } }),
      prisma.kycApplication.count({ where: { status: "rejected" } }),
      prisma.kycApplication.count({ where: { status: "on_hold" } }),
      prisma.kycApplication.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: { select: { email: true, phone: true } }
        }
      })
    ]);

    res.json({ success: true, total, pending, review, verified, rejected, onHold, recent });
  } catch (error) {
    next(error);
  }
};

const getAuditLogs = async (req, res, next) => {
  const { page = 1, limit = 50, severity = "all", search = "" } = req.query;
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const take = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
  const skip = (pageNum - 1) * take;

  try {
    const where = {};
    if (severity !== "all") {
      where.details = { path: ["severity"], string_contains: severity };
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { action: { contains: q } },
        { user: { email: { contains: q } } },
        { user: { phone: { contains: q } } }
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: "desc" },
        take,
        skip,
        include: {
          user: {
            select: { id: true, email: true, phone: true, role: true },
          },
        },
      }),
      prisma.auditLog.count({ where })
    ]);

    res.json({
      success: true,
      logs,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    next(error);
  }
};

const deleteApplication = async (req, res, next) => {
  const { deleteUser = false } = req.query;
  const { id } = req.params;

  try {
    const app = await prisma.kycApplication.findUnique({
      where: { applicationId: id },
      include: { user: true }
    });

    if (!app) {
      return res.status(404).json({ success: false, error: "Application not found" });
    }

    const userId = app.userId;

    if (deleteUser) {
      // Safety check: Don't let admin delete themselves
      if (userId === req.user.id) {
        return res.status(400).json({ success: false, error: "You cannot delete your own admin account" });
      }

      // Delete user (cascade will handle KycApplication and AuditLogs if configured, otherwise manual)
      // Prisma cascade is defined in schema if set, but we'll do it safely
      await prisma.$transaction([
        prisma.auditLog.deleteMany({ where: { userId } }),
        prisma.kycApplication.deleteMany({ where: { userId } }),
        prisma.user.delete({ where: { id: userId } })
      ]);
      
      res.json({ success: true, message: "User and all related data deleted permanently" });
    } else {
      // Just delete the application
      await prisma.kycApplication.delete({
        where: { applicationId: id }
      });

      await writeAuditLog({
        userId: req.user.id,
        action: "kyc_deleted",
        details: { applicationId: id, userId },
        ipAddress: req.ip,
      });

      res.json({ success: true, message: "KYC application deleted permanently" });
    }
  } catch (error) {
    next(error);
  }
};

async function writeAuditLog({ userId, action, details, ipAddress }) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details,
        ipAddress,
      },
    });
  } catch (error) {
    console.error("[AuditLog] Failed to persist log:", error.message);
  }
}

module.exports = {
  getApplications,
  getApplicationById,
  reviewApplication,
  deleteApplication,
  getStats,
  getAuditLogs,
};
