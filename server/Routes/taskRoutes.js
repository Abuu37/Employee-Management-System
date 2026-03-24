import Express from "express";
import { veryifyToken } from "../Middlewares/authMiddleware.js";
import { checkRole } from "../Middlewares/roleMiddleware.js";
import {
  createTask,
  getAllTasks,
  getMyTasks,
  updateTask,
  deleteTask,
} from "../controller/taskController.js";

const router = Express.Router();

// Create a new task (Manager only)
router.post("/create", veryifyToken, checkRole("manager"), createTask);

// Get / VIEW all tasks (Admin and Manager)
router.get("/all", veryifyToken, checkRole("admin", "manager"), getAllTasks);

// Get / VIEW my tasks (Employee)
router.get("/my-tasks", veryifyToken, checkRole("employee"), getMyTasks);

// Update task status (Employee)
router.put("/update/:id", veryifyToken, checkRole("employee"), updateTask);

// Delete task (Admin)
router.delete("/delete/:id", veryifyToken, checkRole("admin"), deleteTask);

export { router as TaskRoute };
