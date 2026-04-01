import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendCredentialsEmail } from "../utils/sendEmail.js";

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log("User already exists with email:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await user.save(); // save to database
    res.status(201).json({
      message: `User registered successfully: ${name} `,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

//..................ADMIN CREATE USER...........................
export const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log("User already exists with email:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    // generate password Auto
    const plainPassword = Math.random().toString(36).slice(-8); // generate random 8 character password

    // Hash password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // Send email with credentials
    await sendCredentialsEmail(name, email, plainPassword);

    await user.save(); // save to database
    res.status(201).json({
      message: `User created successfully and email sent to: ${name} `,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

//..............VIEW USERS...........................

export const getAllUsers = async (req, res) => {
  try {
    let users;

    if (req.user.role === "admin") {
      users = await User.findAll({
        attributes: { exclude: ["password"] },
      });
      res.json(users);
    }

    // manager find employee only
    else if (req.user.role === "manager") {
      users = await User.findAll({
        where: { role: "employee" },
        attributes: { exclude: ["password"] },
      });
      res.json(users);
    }

    // employee find only himself
    else if (req.user.role === "employee") {
      users = await User.findOne({
        where: { id: req.user.id },
        attributes: { exclude: ["password"] },
      });
      res.json(users);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

//..... UPDATE USER...................
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    const user = await User.findByPk(id);

    if (!user) {
      console.log("User not found with id:", id);
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user.role === "admin") {
      user.name = name || user.name;
      user.email = email || user.email;
      user.role = role || user.role;
      await user.save();
      res.json({ message: `User updated successfully: ${user.name}` });
    } else if (req.user.role === "manager") {
      if (user.role === "employee") {
        user.name = name || user.name;
        user.email = email || user.email;
        await user.save();
        res.json({ message: `Employee updated successfully: ${user.name}` });
      } else {
        res
          .status(403)
          .json({ message: "Forbidden: Managers can only update employees" });
      }
    } else if (req.user.role === "employee") {
      if (user.id === req.user.id) {
        user.name = name || user.name;
        user.email = email || user.email;
        await user.save();
        res.json({ message: `Employee updated successfully: ${user.name}` });
      } else {
        res.status(403).json({
          message: "Forbidden: Employees can only update their own profile",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

//..............DELETE USER...........................
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      console.log("User not found with id:", id);
      return res.status(404).json({ message: "User not found" });
    }

    await user.destroy();
    res.json({ message: `User deleted successfully: ${user.name}` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ............LOGIN...........................

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log("User not found with email:", email);
      return res.status(404).json({ message: "User not found" });
    }
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("Invalid password for email:", email);
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, role: user.role }, "secretkey", {
      expiresIn: "1d",
    });

    // Exclude password before sending
    const { password: pwd, ...userWithoutPassword } = user.toJSON();

    res.json({ 
      message: "Login successful", 
      token, "user-role": user.role, 
      "user-name": user.name, 
      "user-email": user.email, 
      "user-id": user.id
     });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ............CHANGE PASSWORD...........................
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message:
          "currentPassword, newPassword, and confirmPassword are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password do not match",
      });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isCurrentMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } 
  
  catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
