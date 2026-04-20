import express from "express";
import {
  setSalary,
  getAllSalaries,
  getSalaryByUserId,
  getMySalary,
  deleteSalary,
} from "../controller/salaryController.js";
import { verifyToken } from "../Middlewares/authMiddleware.js";
import { checkRole } from "../Middlewares/roleMiddleware.js";

const router = express.Router();

// Admin: set/update salary
router.post("/generate", verifyToken, checkRole("admin"), setSalary);

// Admin: get all salaries
router.get("/", verifyToken, checkRole("admin"), getAllSalaries);

// Logged-in user: get own salary
router.get("/me", verifyToken, getMySalary);

// Admin: get salary by user id
router.get("/user/:userId", verifyToken, checkRole("admin"), getSalaryByUserId);

// Admin: delete salary
router.delete("/:id", verifyToken, checkRole("admin"), deleteSalary);

export default router;
