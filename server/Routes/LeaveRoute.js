import express from "express";
import { verifyToken } from "../Middlewares/authMiddleware.js";
import { checkRole } from "../Middlewares/roleMiddleware.js";
import {
  applyForLeave,
  getLeaveApplications,
  managerApproveLeave,
  managerRejectLeave,
  hrApproveLeave,
  hrRejectLeave,
  getHrPendingLeaves,
  getMyLeaves,
  getLeaveBalance,
  cancelLeave,
  getLeavesByUser,
  getLeavesByDateRange,
  getLeavesByStatus,
  getTeamLeaves,
  getManagerLeaves,
  getLeaveStats,
  managerResendRejectedLeave,
} from "../controller/LeaveController.js";

const router = express.Router();

// Employee / Manager applies for leave
router.post(
  "/apply",
  verifyToken,
  checkRole("employee", "manager"),
  applyForLeave,
);

// Leave stats (role-aware)
router.get("/stats", verifyToken, getLeaveStats);

// Admin: all leaves
router.get("/", verifyToken, checkRole("admin"), getLeaveApplications);

// Manager stage-1 approval
router.post(
  "/manager-approve/:id",
  verifyToken,
  checkRole("manager", "admin"),
  managerApproveLeave,
);
router.post(
  "/manager-reject/:id",
  verifyToken,
  checkRole("manager", "admin"),
  managerRejectLeave,
);

// HR / Admin stage-2 approval
router.get("/hr-pending", verifyToken, checkRole("admin"), getHrPendingLeaves);

// HR approves leave
router.post("/hr-approve/:id", verifyToken, checkRole("admin"), hrApproveLeave);

// HR rejects leave
router.post("/hr-reject/:id", verifyToken, checkRole("admin"), hrRejectLeave);

router.put(
  "/resend/:id",
  verifyToken,
  checkRole("manager"),
  managerResendRejectedLeave,
);

// Employee views own leaves and balance
router.get(
  "/my-leaves",
  verifyToken,
  checkRole("employee", "manager"),
  getMyLeaves,
);

// Employee views leave balance
router.get(
  "/leave-balance",
  verifyToken,
  checkRole("employee", "manager", "admin"),
  getLeaveBalance,
);

// Employee cancels pending leave
router.delete(
  "/cancel/:id",
  verifyToken,
  checkRole("employee", "manager", "admin"),
  cancelLeave,
);

// Manager and Admin views leaves by various filters
router.get(
  "/user/:userId",
  verifyToken,
  checkRole("manager", "admin"),
  getLeavesByUser,
);

// Admin views leaves by date range and status
router.get(
  "/date-range",
  verifyToken,
  checkRole("manager", "admin"),
  getLeavesByDateRange,
);

// Admin views leaves by status
router.get(
  "/status",
  verifyToken,
  checkRole("manager", "admin"),
  getLeavesByStatus,
);

// Manager views team leaves, Admin views all manager leaves
router.get("/team-leaves", verifyToken, checkRole("manager"), getTeamLeaves);

// Admin views all manager leaves
router.get(
  "/manager-leaves",
  verifyToken,
  checkRole("admin"),
  getManagerLeaves,
);

export default router;
