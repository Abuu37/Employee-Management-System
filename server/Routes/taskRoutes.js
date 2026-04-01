import Express from "express";
import { veryifyToken } from "../Middlewares/authMiddleware.js";
import { checkRole } from "../Middlewares/roleMiddleware.js";
import {
  createTask,
  getAllTasks,
  getTasksByProject,
  updateTask,
  deleteTask,
  getMyTasks,
  updateTaskStatus,
  getTaskByIdForUser,
} from "../controller/taskController.js";

const router = Express.Router();

// Create a new task (Manager only)
router.post("/create", veryifyToken, checkRole("manager"), createTask);

// Get / VIEW all tasks (Admin and Manager)
router.get("/all", veryifyToken, checkRole("admin", "manager"), getAllTasks);

// Get tasks by project id (Admin and Manager)
router.get(
  "/project/:project_id",
  veryifyToken,
  checkRole("admin", "manager"),
  getTasksByProject,
);

// Update task status (Manager only)
router.put("/update/:id", veryifyToken, checkRole("manager"), updateTask);

// Delete task (Admin and Manager)
router.delete(
  "/delete/:id",
  veryifyToken,
  checkRole("admin", "manager"),
  deleteTask,
);

// Get tasks assigned (employee)
router.get("/mytasks", veryifyToken, checkRole("employee"), getMyTasks);
router.get("/my-tasks", veryifyToken, checkRole("employee"), getMyTasks);

// Update task status (Employee only)
router.put(
  "/:id/status",
  veryifyToken,
  checkRole("employee", "manager"),
  updateTaskStatus,
);

// Get a single task by ID (employee can only access their own)
router.get("/:id", veryifyToken, checkRole("employee", "manager"), getTaskByIdForUser);

export { router as TaskRoute };
