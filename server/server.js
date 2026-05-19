import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { sanitizeInput } from "./Middlewares/sanitizeInput.js";

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

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Try again later." },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

// ===================== GLOBAL MIDDLEWARE =====================
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sanitizeInput);
app.use("/api", apiLimiter);

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
app.use("/api/auth", authLimiter, AuthRoute);
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
    if (env.nodeEnv !== "production") {
      await sequelize.sync();
      console.log("Database synced successfully");
    }

    const PORT = env.port;

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
    if (error?.name === "SequelizeConnectionError") {
      const pgCode = error?.original?.code;
      if (pgCode === "28P01") {
        console.error("\nPostgreSQL authentication failed.");
        console.error("Check server/.env DB_USER and DB_PASSWORD values.");
        console.error("Then restart the server after updating credentials.\n");
      }
    }
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
