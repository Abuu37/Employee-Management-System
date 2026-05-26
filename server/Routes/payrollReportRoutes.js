import Express from "express";
import { verifyToken } from "../Middlewares/authMiddleware.js";
import { checkRole } from "../Middlewares/roleMiddleware.js";
import {
  getPayrollSummary,
  getPayrollDetails,
  getPayrollTrends,
  getSalaryAnalytics,
} from "../controller/report/payrollReportController.js";

const router = Express.Router();

// ── Payroll Summary (per-employee aggregation) ───────────────────────
// GET /api/reports/payroll/summary
// Query: year, month, status, userId, department_id
// Access: admin + manager (scoped) + employee (own only)
router.get(
  "/summary",
  verifyToken,
  checkRole("admin", "manager", "employee"),
  getPayrollSummary,
);

// ── Payroll Details (paginated individual records) ───────────────────
// GET /api/reports/payroll/details
// Query: year, month, status, userId, department_id, page, limit
// Access: admin + manager (scoped) + employee (own only)
router.get(
  "/details",
  verifyToken,
  checkRole("admin", "manager", "employee"),
  getPayrollDetails,
);

// ── Payroll Trends (monthly expense chart data) ──────────────────────
// GET /api/reports/payroll/trends
// Query: year, status, department_id
// Access: admin + manager only
router.get(
  "/trends",
  verifyToken,
  checkRole("admin", "manager"),
  getPayrollTrends,
);

// ── Salary Analytics (dashboard stats + top earners + dept totals) ───
// GET /api/reports/payroll/analytics
// Query: year, month, status
// Access: admin only
router.get("/analytics", verifyToken, checkRole("admin"), getSalaryAnalytics);

export default router;
