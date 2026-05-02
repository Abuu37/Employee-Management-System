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
} from "../controller/LeaveController.js";

const router = express.Router();

// Employee / Manager applies for leave
router.post("/apply", verifyToken, checkRole("employee", "manager"), applyForLeave);

// Admin: all leaves
router.get("/", verifyToken, checkRole("admin"), getLeaveApplications);

// Manager stage-1 approval
router.post("/manager-approve/:id", verifyToken, checkRole("manager", "admin"), managerApproveLeave);
router.post("/manager-reject/:id", verifyToken, checkRole("manager", "admin"), managerRejectLeave);

// HR / Admin stage-2 approval
router.get("/hr-pending", verifyToken, checkRole("admin"), getHrPendingLeaves);
router.post("/hr-approve/:id", verifyToken, checkRole("admin"), hrApproveLeave);
router.post("/hr-reject/:id", verifyToken, checkRole("admin"), hrRejectLeave);

router.get(
  "/my-leaves",
  verifyToken,
  checkRole("employee", "manager"),
  getMyLeaves,
);
router.get(
  "/leave-balance",
  verifyToken,
  checkRole("employee", "manager", "admin"),
  getLeaveBalance,
);
router.delete(
  "/cancel/:id",
  verifyToken,
  checkRole("employee", "manager", "admin"),
  cancelLeave,
);
router.get(
  "/user/:userId",
  verifyToken,
  checkRole("manager", "admin"),
  getLeavesByUser,
);
router.get(
  "/date-range",
  verifyToken,
  checkRole("manager", "admin"),
  getLeavesByDateRange,
);
router.get(
  "/status",
  verifyToken,
  checkRole("manager", "admin"),
  getLeavesByStatus,
);
router.get("/team-leaves", verifyToken, checkRole("manager"), getTeamLeaves);
router.get(
  "/manager-leaves",
  verifyToken,
  checkRole("admin"),
  getManagerLeaves,
);

export default router;
