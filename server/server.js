import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { sequelize, connectDB } from "./config/db.js";

// ===================== ROUTES =====================
import { AuthRoute } from "./Routes/AuthRoutes.js";
import { UserRoute } from "./Routes/userRoutes.js";
import { TaskRoute } from "./Routes/taskRoutes.js";
import { ProjectRoute } from "./Routes/projectRoutes.js";
import { TaskCommentRoute } from "./Routes/taskCommentRoutes.js";
import LeaveRoute from "./Routes/LeaveRoute.js";
import PayrollRoute from "./Routes/payrollRoutes.js";
import SalaryRoute from "./Routes/salaryRoutes.js";
import DocumentRoute from "./Routes/documentRoutes.js";
import { DashboardRoute } from "./Routes/dashboardRoutes.js";
import AttendanceRoute from "./Routes/Attendances.js";
import DepartmentRoute from "./Routes/departmentRoutes.js";
import NotificationRoute from "./Routes/notificationRoutes.js";

// ===================== MODEL RELATIONSHIPS =====================
import "./models/index.js";

// ===================== PATH SETUP =====================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===================== APP INIT =====================
const app = express();

// ===================== GLOBAL MIDDLEWARE =====================
app.use(
  cors({
    origin: "*", // change in production
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===================== HEALTH CHECK =====================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running successfully",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date(),
  });
});

// ===================== API ROUTES =====================
app.use("/api/auth", AuthRoute);
app.use("/api/user", UserRoute);
app.use("/api/task", TaskRoute);
app.use("/api/project", ProjectRoute);
app.use("/api/tasks_comments", TaskCommentRoute);
app.use("/api/leaves", LeaveRoute);
app.use("/api/payroll", PayrollRoute);
app.use("/api/salary", SalaryRoute);
app.use("/api/documents", DocumentRoute);
app.use("/api/dashboard", DashboardRoute);
app.use("/api/attendance", AttendanceRoute);
app.use("/api/departments", DepartmentRoute);
app.use("/api/notifications", NotificationRoute);

// ===================== 404 HANDLER =====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// ===================== GLOBAL ERROR HANDLER =====================
app.use((err, req, res, next) => {
  console.error("Global Express Error:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
});

// ===================== SERVER START =====================
let server;

const startServer = async () => {
  try {
    console.log("Connecting database...");

    await connectDB();
    console.log("Database connected successfully");

    // sync only in development
    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync();
      console.log("Database synced successfully");
    }

    const PORT = process.env.PORT || 5000;

    server = app.listen(PORT);

    server.on("listening", () => {
      console.log(`
=========================================
✅ Server running successfully
Environment : ${process.env.NODE_ENV || "development"}
Port        : ${PORT}
URL         : http://localhost:${PORT}
=========================================
      `);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`
=========================================
❌ Port ${PORT} is already in use
Stop the old process or change PORT
=========================================
        `);
      } else {
        console.error("Server error:", err);
      }

      process.exit(1);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

// ===================== PROCESS ERROR HANDLERS =====================
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down server...");

  if (server) {
    server.close(async () => {
      await sequelize.close();
      console.log("Database connection closed");
      console.log("Server stopped");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// ===================== RUN APP =====================
startServer();