import express from "express";
import { veryifyToken } from "../Middlewares/authMiddleware.js";
import {
    addComment,
    getComments,
} from "../controller/taskCommentController.js";

const router = express.Router();

// Add a comment to a task
router.post("/:taskId", veryifyToken, addComment);

// Get comments for a task
router.get("/:taskId", veryifyToken, getComments);

export { router as TaskCommentRoute };