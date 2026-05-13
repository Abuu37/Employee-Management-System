import express from "express";
import { verifyToken } from "../Middlewares/authMiddleware.js";
import { checkRole } from "../Middlewares/roleMiddleware.js";
import { createUserByAdmin } from "../controller/userController.js";
import { getAllUsers } from "../controller/userController.js";
import { getEmployees } from "../controller/userController.js";
import { getEmployeeById } from "../controller/userController.js";
import { getEmployeeInsights } from "../controller/userController.js";
import { getManagers } from "../controller/userController.js";
import { getManagerById } from "../controller/userController.js";
import { updateUser } from "../controller/userController.js";
import { deleteUser } from "../controller/userController.js";
import { changePassword } from "../controller/userController.js";
const router = express.Router();

//only admin can access this route
router.get("/admin", verifyToken, checkRole("admin"), (req, res) => {
  res.json({ message: "Welcome Admin!" });
});

//Both admin and manager can access this route
router.get(
  "/manager",
  verifyToken,
  checkRole("admin", "manager"),
  (req, res) => {
    res.json({ message: "Welcome Manager!" });
  },
);

// All employee can access this route
router.get(
  "/employee",
  verifyToken,
  checkRole("admin", "manager", "employee"),
  (req, res) => {
    res.json({ message: "Welcome Employee!" });
  },
);

//create user by admin
router.post("/create-user", verifyToken, checkRole("admin"), createUserByAdmin);

//view users by admin, manager and employee
router.get(
  "/view-users",
  verifyToken,
  checkRole("admin", "manager", "employee"),
  getAllUsers,
);

//view employees by admin and manager
router.get(
  "/employees",
  verifyToken,
  checkRole("admin", "manager"),
  getEmployees,
);

//view employee by id for admin and manager
router.get(
  "/employees/:id",
  verifyToken,
  checkRole("admin", "manager"),
  getEmployeeById,
);

//view employee insights(view tabs) by id for admin and manager
router.get(
  "/employees/:id/insights",
  verifyToken,
  checkRole("admin", "manager"),
  getEmployeeInsights,
);

//view managers by admin
router.get("/managers", verifyToken, checkRole("admin"), getManagers);

//view manager by id for admin
router.get("/managers/:id", verifyToken, checkRole("admin"), getManagerById);

//update user by admin and manager
router.put(
  "/update-user/:id",
  verifyToken,
  checkRole("admin", "manager"),
  updateUser,
);

//delete user by admin
router.delete("/delete-user/:id", verifyToken, checkRole("admin"), deleteUser);

//change password for logged-in user
router.put(
  "/change-password",
  verifyToken,
  checkRole("admin", "manager", "employee"),
  changePassword,
);

export { router as UserRoute };
