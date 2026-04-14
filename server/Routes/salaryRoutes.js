import express from "express";
import { setSalary } from "../controller/salaryController.js";
import { verifyToken } from "../Middlewares/authMiddleware.js";
import { checkRole } from "../Middlewares/roleMiddleware.js";

const router = express.Router();

// Only admin can set salary
router.post("/", verifyToken, checkRole("admin"), setSalary);

export default router;
