import express from "express";
import { getDashboardSummary } from "../controller/dashboardController.js";
import { verifyToken } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.get("/summary", verifyToken, getDashboardSummary);

export const DashboardRoute = router;
