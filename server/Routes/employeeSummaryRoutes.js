import Express from "express";
import { verifyToken } from "../Middlewares/authMiddleware.js";
import { checkRole } from "../Middlewares/roleMiddleware.js";
import {
  getEmployeeSummary,
  getEmployeeList,
  getDepartmentStats,
} from "../controller/report/employeeSummaryController.js";

const router = Express.Router();

// All routes: must be logged in + admin or manager
const protect = [verifyToken, checkRole("admin", "manager")];

// ── Employee Summary (dashboard stats) ──────────────────────────────
// GET /api/reports/employees/summary
// Query: status, employment_type, gender, role, department_id,
//        joinDateFrom, joinDateTo, search
router.get("/summary", ...protect, getEmployeeSummary);

// ── Department Statistics ────────────────────────────────────────────
// GET /api/reports/employees/department-stats
// Returns: per-dept headcount, active/inactive split, manager info
router.get("/department-stats", ...protect, getDepartmentStats);

// ── Employee List (paginated + filtered) ────────────────────────────
// GET /api/reports/employees/
// Query: same as summary + page, limit, sortBy, sortOrder
router.get("/", ...protect, getEmployeeList);

export default router;
