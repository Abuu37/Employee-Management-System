import express from "express";
import {
  generatePayroll,
  getPayrollDetails,
  getTeamPayroll,
  getMyPayroll,
  approvePayroll,
  markAsPaid,
  getPayrollStats,
} from "../controller/payrollController.js";
import { verifyToken } from "../Middlewares/authMiddleware.js";
import { checkRole } from "../Middlewares/roleMiddleware.js";

const router = express.Router();

// Generate payroll (Admin + Manager)
router.post(
  "/generate",
  verifyToken,
  checkRole("admin", "manager"),
  generatePayroll,
);

// Payroll stats (role-aware)
router.get("/stats", verifyToken, getPayrollStats);

// Admin: all payrolls
router.get("/", verifyToken, checkRole("admin", "manager"), getPayrollDetails);

// Manager: team payrolls
router.get("/team", verifyToken, checkRole("manager"), getTeamPayroll);

// Employee: own payroll
router.get(
  "/me",
  verifyToken,
  checkRole("employee", "manager", "admin"),
  getMyPayroll,
);

// Admin + Manager: approve payroll
router.put(
  "/:id/approve",
  verifyToken,
  checkRole("admin", "manager"),
  approvePayroll,
);

// Admin: mark payroll as paid
router.put("/:id/pay", verifyToken, checkRole("admin"), markAsPaid);

export default router;
