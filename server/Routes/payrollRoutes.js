import express from "express";
import {
  generatePayroll,
  getPayrollDetails,
  getTeamPayroll,
  getMyPayroll,
  approvePayroll,
  markAsPaid,
} from "../controller/payrollController.js";
import { verifyToken } from "../Middlewares/authMiddleware.js";
import { checkRole } from "../Middlewares/roleMiddleware.js";

const router = express.Router();

router.post(
  "/generate",
  verifyToken,
  checkRole("admin", "manager"),
  generatePayroll,
);

router.get(
  "/", 
  verifyToken, 
  getPayrollDetails
);

router.get(
  "/team",
  verifyToken,
  checkRole("manager"),
  getTeamPayroll
);

router.get(
  "/me", 
  verifyToken, 
  getMyPayroll
);

router.put(
  "/:id/approve",
  verifyToken,
  checkRole("admin", "manager"),
  approvePayroll,
);

router.put(
  "/:id/pay",
  verifyToken,
  checkRole("admin"),
  markAsPaid
);

export default router;
