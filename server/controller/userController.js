import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  sendCredentialsEmail,
  sendPasswordResetEmail,
} from "../utils/sendEmail.js";
import { LeaveBalance } from "../models/index.js";

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { name, email, password, role, manager_id } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Manager assignment logic
    let assignedManagerId = null;

    if (role === "employee") {
      assignedManagerId = manager_id || null;
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      manager_id: assignedManagerId,
    });

    // ✅ Create Leave Balance
    await LeaveBalance.create({
      userId: user.id,
      annual: 20,
      sick: 10,
      casual: 5,
    });

    res.status(201).json({
      message: `User registered successfully: ${name}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= ADMIN / MANAGER CREATE USER =================
export const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, role, manager_id } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const plainPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // ✅ Manager assignment logic
    let assignedManagerId = null;

    if (req.user.role === "manager") {
      // Manager creates → auto assign to himself
      assignedManagerId = req.user.id;
    } else if (req.user.role === "admin") {
      // Admin creates employee → must assign manager (optional but recommended)
      if (role === "employee") {
        assignedManagerId = manager_id || null;
      }
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      manager_id: assignedManagerId,
    });

    // ✅ Send credentials email
    await sendCredentialsEmail(name, email, plainPassword);

    // ✅ Create leave balance
    await LeaveBalance.create({
      userId: user.id,
      annual: 20,
      sick: 10,
      casual: 5,
    });

    res.status(201).json({
      message: `User created successfully: ${name}`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET USERS =================
export const getAllUsers = async (req, res) => {
  try {
    let users;

    if (req.user.role === "admin") {
      users = await User.findAll({
        attributes: { exclude: ["password"] },
      });
    } else if (req.user.role === "manager") {
      // ✅ ONLY their employees
      users = await User.findAll({
        where: {
          role: "employee",
          manager_id: req.user.id,
        },
        attributes: { exclude: ["password"] },
      });
    } else {
      users = await User.findOne({
        where: { id: req.user.id },
        attributes: { exclude: ["password"] },
      });
    }

    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= UPDATE USER =================
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, manager_id } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user.role === "admin") {
      user.name = name || user.name;
      user.email = email || user.email;
      user.role = role || user.role;

      // ✅ Admin can reassign manager
      if (manager_id !== undefined) {
        user.manager_id = manager_id;
      }

      await user.save();
      return res.json({ message: `User updated: ${user.name}` });
    }

    if (req.user.role === "manager") {
      if (user.role === "employee" && user.manager_id === req.user.id) {
        user.name = name || user.name;
        user.email = email || user.email;
        await user.save();

        return res.json({ message: `Employee updated: ${user.name}` });
      }

      return res.status(403).json({
        message: "Managers can only update their own employees",
      });
    }

    if (req.user.role === "employee") {
      if (user.id === req.user.id) {
        user.name = name || user.name;
        user.email = email || user.email;
        await user.save();

        return res.json({ message: "Profile updated" });
      }

      return res.status(403).json({
        message: "You can only update your own profile",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= DELETE USER =================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Optional: restrict manager delete
    if (req.user.role === "manager" && user.manager_id !== req.user.id) {
      return res.status(403).json({
        message: "You can only delete your own employees",
      });
    }

    await user.destroy();

    res.json({ message: `User deleted: ${user.name}` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET ME =================
export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "role"],
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        field: "email",
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        field: "password",
        message: "Invalid password",
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, "secretkey", {
      expiresIn: "1d",
    });

    res.json({
      message: "Login successful",
      token,
      "user-role": user.role,
      "user-name": user.name,
      "user-email": user.email,
      "user-id": user.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= CHANGE PASSWORD =================
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    const user = await User.findByPk(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Return success anyway to avoid email enumeration
      return res.json({
        message: "If that email exists, a reset link has been sent.",
      });
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    const resetUrl = `http://localhost:5173/reset-password?token=${token}`;
    await sendPasswordResetEmail(user.name, user.email, resetUrl);

    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    const user = await User.findOne({ where: { resetPasswordToken: token } });

    if (
      !user ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      return res
        .status(400)
        .json({ message: "Reset link is invalid or has expired." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
