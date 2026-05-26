import Express from "express";
import { verifyToken } from "../Middlewares/authMiddleware.js";
import { checkRole } from "../Middlewares/roleMiddleware.js";
import {
  getAttendanceSummary,
  getAttendanceDetails,
  getDailyAttendanceTrends,
  exportAttendanceCsv,
} from "../controller/report/attendancereportController.js";

const router = Express.Router();

// ── Attendance Summary (per-employee aggregation) ────────────────────
// GET /api/reports/attendance/summary
// Query: dateFrom, dateTo, status, userId, department
router.get(
  "/summary",
  verifyToken,
  checkRole("admin", "manager", "employee"),
  getAttendanceSummary,
);

// ── Attendance Details (paginated records) ───────────────────────────
// GET /api/reports/attendance/detail
// Query: dateFrom, dateTo, status, userId, department, page, limit
router.get(
  "/detail",
  verifyToken,
  checkRole("admin", "manager", "employee"),
  getAttendanceDetails,
);

// ── Daily Attendance Trends (chart data) ─────────────────────────────
// GET /api/reports/attendance/trends
// Query: dateFrom, dateTo, status, userId, department
router.get(
  "/trends",
  verifyToken,
  checkRole("admin", "manager", "employee"),
  getDailyAttendanceTrends,
);

// ── Attendance CSV Export ───────────────────────────────────────────
// GET /api/reports/attendance/export/csv
router.get(
  "/export/csv",
  verifyToken,
  checkRole("admin", "manager", "employee"),
  exportAttendanceCsv,
);

export default router;
