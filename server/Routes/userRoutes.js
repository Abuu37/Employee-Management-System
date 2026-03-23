import express from "express";
import { veryifyToken } from "../Middlewares/authMiddleware.js";
import { checkRole } from "../Middlewares/roleMiddleware.js";
import { createUserByAdmin } from "../controller/userController.js";
import { getAllUsers } from "../controller/userController.js";
import { updateUser } from "../controller/userController.js";
import { deleteUser } from "../controller/userController.js";
const router = express.Router();

//only admin can access this route
router.get("/admin", veryifyToken, checkRole("admin"), (req, res) => {
  res.json({ message: "Welcome Admin!" });
});

//Both admin and manager can access this route
router.get(
  "/manager",
  veryifyToken,
  checkRole("admin", "manager"),
  (req, res) => {
    res.json({ message: "Welcome Manager!" });
  },
);

// All employee can access this route
router.get(
  "/employee",
  veryifyToken,
  checkRole("admin", "manager", "employee"),
  (req, res) => {
    res.json({ message: "Welcome Employee!" });
  },
);

//create user by admin
router.post(
  "/create-user",
  veryifyToken,
  checkRole("admin"),
  createUserByAdmin,
);

//view users by admin, manager and employee
router.get(
  "/view-users",
  veryifyToken,
  checkRole("admin", "manager", "employee"),
  getAllUsers,
);

//update user by admin and manager
router.put(
  "/update-user/:id",
  veryifyToken,
  checkRole("admin", "manager"),
  updateUser,
);

//delete user by admin
router.delete("/delete-user/:id", veryifyToken, checkRole("admin"), deleteUser);

export { router as UserRoute };
