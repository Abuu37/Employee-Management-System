import express from "express";
import { verifyToken } from "../Middlewares/authMiddleware.js";
import { checkRole } from "../Middlewares/roleMiddleware.js";
import {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  toggleDepartmentStatus,
  assignManager,
  getDepartmentStats,
} from "../controller/departmentController.js";

const router = express.Router();

// Stats summary
router.get("/stats", verifyToken, checkRole("admin"), getDepartmentStats);

// Get all departments
router.get("/", verifyToken, checkRole("admin"), getAllDepartments);

// Get department by ID
router.get("/:id", verifyToken, checkRole("admin"), getDepartmentById);

// Create department
router.post("/", verifyToken, checkRole("admin"), createDepartment);

// Update department
router.put("/:id", verifyToken, checkRole("admin"), updateDepartment);

// Delete department
router.delete("/:id", verifyToken, checkRole("admin"), deleteDepartment);

// Toggle active/inactive
router.patch(
  "/:id/toggle-status",
  verifyToken,
  checkRole("admin"),
  toggleDepartmentStatus,
);

// Assign manager
router.patch(
  "/:id/assign-manager",
  verifyToken,
  checkRole("admin"),
  assignManager,
);

export default router;
