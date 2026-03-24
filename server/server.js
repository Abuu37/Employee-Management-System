import express from "express";
import cors from "cors";
import { AuthRoute } from "./Routes/AuthRoutes.js";
import { UserRoute } from "./Routes/userRoutes.js";
import { TaskRoute } from "./Routes/taskRoutes.js";
import { ProjectRoute } from "./Routes/projectRoutes.js";
import { sequelize, connectDB } from "./config/db.js";
import "./models/index.js";

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", AuthRoute);
app.use("/api/user", UserRoute);
app.use("/api/task", TaskRoute);
app.use("/api/project", ProjectRoute);

const startServer = async () => {
  try {
    await connectDB();
    await sequelize.sync();
    console.log("Database synced");

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  } catch (err) {
    console.error("Server startup failed:", err);
  }
};

startServer();
