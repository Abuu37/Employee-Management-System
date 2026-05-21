import Express from "express";
import { verifyToken } from "../Middlewares/authMiddleware.js";
import { checkRole } from "../Middlewares/roleMiddleware.js";
import {
  getAttendanceSummary,
  getAttendanceDetails,
  getDailyAttendanceTrends,
} from "../controller/report/attendancereportController.js";

const router = Express.Router();

// ========= All report routes require login + admin or manager (ATTENDANCE) ==========

router.get(
  "/attendance/summary",
  verifyToken,
  checkRole("admin", "manager"),
  getAttendanceSummary,
);

router.get(
  "/attendance/detail",
  verifyToken,
  checkRole("admin", "manager"),
  getAttendanceDetails,
);

router.get(
  "/attendance/trends",
  verifyToken,
  checkRole("admin", "manager"),
  getDailyAttendanceTrends,
);

export default router;
