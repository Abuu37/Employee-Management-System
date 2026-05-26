import Express from "express";
import { verifyToken } from "../Middlewares/authMiddleware.js";
import { checkRole } from "../Middlewares/roleMiddleware.js";
import {
  getLeaveSummary,
  getLeaveDetails,
  getLeaveTrends,
  getLeaveBalance,
} from "../controller/report/leaveReportController.js";

const router = Express.Router();

// ── Leave Summary (per-employee aggregation) ─────────────────────────
// GET /api/reports/leaves/summary
// Query: dateFrom, dateTo, type, status, userId, department_id
router.get(
  "/summary",
  verifyToken,
  checkRole("admin", "manager", "employee"),
  getLeaveSummary,
);

// ── Leave Details (paginated individual records) ─────────────────────
// GET /api/reports/leaves/details
// Query: dateFrom, dateTo, type, status, userId, department_id, page, limit
router.get(
  "/details",
  verifyToken,
  checkRole("admin", "manager", "employee"),
  getLeaveDetails,
);

// ── Leave Trends (monthly chart data) ───────────────────────────────
// GET /api/reports/leaves/trends
// Query: dateFrom, dateTo, type, status, department_id
router.get(
  "/trends",
  verifyToken,
  checkRole("admin", "manager", "employee"),
  getLeaveTrends,
);

// ── Leave Balance (allocated vs used vs remaining) ───────────────────
// GET /api/reports/leaves/balance
// Query: department_id, userId, page, limit
router.get(
  "/balance",
  verifyToken,
  checkRole("admin", "manager", "employee"),
  getLeaveBalance,
);

export default router;
