import Express from "express";
import { verifyToken } from "../Middlewares/authMiddleware.js";
import { checkRole } from "../Middlewares/roleMiddleware.js";
import {
    checkIn,
    checkOut,
    getMyAttendance,
    getAllAttendance,
    getTeamAttendance,
    getAttendanceByStatus
} from "../controller/attendanceController.js";

const router = Express.Router(); 
// Employee check-in
router.post(
    "/check-in",
    verifyToken,
    checkRole("employee", "manager"),
    checkIn
);

// Employee check-out
router.post(
    "/check-out",
    verifyToken,
    checkRole("employee", "manager"),
    checkOut
);

// admin
router.get(
    "/all",
    verifyToken,
    checkRole("admin"),
    getAllAttendance
);

// manager
router.get(
    "/team",
    verifyToken,
    checkRole("manager"),
    getTeamAttendance
);

// employee and manager
router.get(
    "/my",
    verifyToken,
    checkRole("employee", "manager"),
    getMyAttendance
);

//get attendance by status
router.get(
    "/status/:status",
    verifyToken,
    checkRole("admin", "manager"),
    getAttendanceByStatus
);


export default router;