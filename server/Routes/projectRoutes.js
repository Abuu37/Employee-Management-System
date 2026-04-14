import express from "express";
import { verifyToken } from "../Middlewares/authMiddleware.js";
import { checkRole } from "../Middlewares/roleMiddleware.js";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controller/projectController.js";

const router = express.Router();

// Create a new project (Admin only)
router.post("/create", verifyToken, checkRole("admin"), createProject);

// Get / VIEW all projects (Admin and Manager)
router.get("/all", verifyToken, checkRole("admin", "manager"), getProjects);

// Get / VIEW project by id (Admin and Manager)
router.get("/:id", verifyToken, checkRole("admin", "manager"), getProjectById);

// Update a project (Admin)
router.put("/update/:id", verifyToken, checkRole("admin"), updateProject);

// Delete a project (Admin only)
router.delete("/delete/:id", verifyToken, checkRole("admin"), deleteProject);

export { router as ProjectRoute };
