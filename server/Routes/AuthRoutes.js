import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  login,
  getMe,
  forgotPassword,
  resetPassword,
  uploadAvatar,
} from "../controller/userController.js";
import { verifyToken } from "../Middlewares/authMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads", "avatars"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user?.id ?? Date.now()}-${Date.now()}${ext}`);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
  fileFilter: (req, file, cb) => {
    if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG and WebP images are allowed"));
    }
  },
});

const AuthRoute = express.Router();
AuthRoute.post("/login", login);
AuthRoute.get("/me", verifyToken, getMe);
AuthRoute.post(
  "/avatar",
  verifyToken,
  avatarUpload.single("avatar"),
  uploadAvatar,
);
AuthRoute.post("/forgot-password", forgotPassword);
AuthRoute.post("/reset-password", resetPassword);

export { AuthRoute };
