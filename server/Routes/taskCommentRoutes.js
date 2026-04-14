import express from "express";
import { verifyToken } from "../Middlewares/authMiddleware.js";
import {
  addComment,
  getComments,
} from "../controller/taskCommentController.js";

const router = express.Router();

// Add a comment to a task
router.post("/:taskId", verifyToken, addComment);

// Get comments for a task
router.get("/:taskId", verifyToken, getComments);

export { router as TaskCommentRoute };
