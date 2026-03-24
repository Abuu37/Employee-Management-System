import express from "express";
import { veryifyToken } from "../Middlewares/authMiddleware.js";
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
router.post(
    "/create", 
    veryifyToken, 
    checkRole("admin"), 
    createProject
);

// Get / VIEW all projects (Admin and Manager)
router.get(
    "/all", 
    veryifyToken, 
    checkRole("admin", "manager"), 
    getProjects
);

// Get / VIEW project by id (Admin and Manager)
router.get(
    "/:id", 
    veryifyToken, 
    checkRole("admin", "manager"), 
    getProjectById
);

// Update a project (Admin)
router.put(
  "/update/:id",
  veryifyToken,
  checkRole("admin"),
  updateProject,
);

// Delete a project (Admin only)
router.delete(
    "/delete/:id", 
    veryifyToken, 
    checkRole("admin"), 
    deleteProject
);

export { router as ProjectRoute };
