import bcrypt from "bcryptjs";
import { sequelize } from "./config/db.js";
import "./models/index.js";
import User from "./models/user.js";

const hash = await bcrypt.hash("admin123456", 10);

await sequelize.authenticate();

const existing = await User.findOne({ where: { email: "admin@company.com" } });
if (existing) {
  console.log("Admin user already exists.");
} else {
  await User.create({
    name: "Admin",
    email: "admin@company.com",
    password: hash,
    role: "admin",
  });
  console.log("Admin user created successfully.");
  console.log("Email:    admin@company.com");
  console.log("Password: admin123456");
}

await sequelize.close();
