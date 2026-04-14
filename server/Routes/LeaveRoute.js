import express from "express";
import { verifyToken } from "../Middlewares/authMiddleware.js"; 
import { checkRole } from "../Middlewares/roleMiddleware.js";
import {
  applyForLeave,
  getLeaveApplications,
  approveLeave,
  rejectLeave,
  getMyLeaves,
  getLeaveBalance,
  cancelLeave, 
  getLeavesByUser,
  getLeavesByDateRange, 
  getLeavesByStatus, 
} from "../controller/LeaveController.js";

const router = express.Router();

router.post(
    "/apply", 
    verifyToken, 
    checkRole("employee", "manager"),
    applyForLeave
);

router.get(
    "/", verifyToken, 
    checkRole("manager", "admin"), 
    getLeaveApplications
);

router.post(
    "/approve/:id", 
    verifyToken, 
    checkRole("manager", "admin"), 
    approveLeave
);

router.post(
    "/reject/:id", 
    verifyToken, 
    checkRole("manager", "admin"), 
    rejectLeave
);

router.get(
    "/my-leaves", 
    verifyToken, 
    checkRole("employee", "manager"), 
    getMyLeaves
);
router.get(
    "/leave-balance", 
    verifyToken, 
    checkRole("employee", "manager", "admin"), 
    getLeaveBalance
);
router.delete(
    "/cancel/:id", 
    verifyToken, 
    checkRole("employee", "manager", "admin"), 
    cancelLeave
);
router.get(
    "/user/:userId", 
    verifyToken, 
    checkRole("manager", "admin"), 
    getLeavesByUser
);
router.get(
    "/date-range", 
    verifyToken, 
    checkRole("manager", "admin"), 
    getLeavesByDateRange
);
router.get(
    "/status", 
    verifyToken, 
    checkRole("manager", "admin"), 
    getLeavesByStatus
);


export default router;
