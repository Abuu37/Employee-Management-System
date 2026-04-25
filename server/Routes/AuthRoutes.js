import express from "express";
import {
  login,
  getMe,
  forgotPassword,
  resetPassword,
} from "../controller/userController.js";
import { verifyToken } from "../Middlewares/authMiddleware.js";

const AuthRoute = express.Router();
AuthRoute.post("/login", login);
AuthRoute.get("/me", verifyToken, getMe);
AuthRoute.post("/forgot-password", forgotPassword);
AuthRoute.post("/reset-password", resetPassword);

export { AuthRoute };
