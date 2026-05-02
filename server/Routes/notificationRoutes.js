import express from "express";
import { verifyToken } from "../Middlewares/authMiddleware.js";
import {
  getMyNotifications,
  markOneRead,
  markAllRead,
  deleteNotification,
  clearAll,
} from "../controller/notificationController.js";

const router = express.Router();

router.get("/", verifyToken, getMyNotifications);
router.patch("/read-all", verifyToken, markAllRead);
router.patch("/:id/read", verifyToken, markOneRead);
router.delete("/clear-all", verifyToken, clearAll);
router.delete("/:id", verifyToken, deleteNotification);

export default router;
