import User from "../models/user.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Op } from "sequelize";
import Attendance from "../models/Attendance.js";
import Task from "../models/task.js";
import Leave from "../models/Leave.js";
import {
  sendCredentialsEmail,
  sendPasswordResetEmail,
} from "../utils/sendEmail.js";
import { LeaveBalance } from "../models/index.js";
import { env } from "../config/env.js";
import {
  REFRESH_COOKIE_NAME,
  clearRefreshCookie,
  setRefreshCookie,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

const hashToken = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

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
    const {
      name,
      email,
      role,
      manager_id,
      department,
      department_id,
      position,
      phone,
      gender,
      date_of_birth,
      address,
      emergency_contact,
      employment_type,
      employee_id,
      join_date,
      status,
      reports_to,
      office_branch,
    } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const provisionalPassword = crypto.randomBytes(24).toString("hex");
    const hashedPassword = await bcrypt.hash(provisionalPassword, 12);

    const generatedEmployeeId = `EMP-${Date.now().toString().slice(-6)}-${crypto
      .randomBytes(2)
      .toString("hex")
      .toUpperCase()}`;
    const defaultJoinDate = new Date().toISOString().slice(0, 10);

    // ✅ Manager assignment logic
    let assignedManagerId = null;
    let assignedDepartmentId = null;
    let assignedDepartmentName = null;

    if (req.user.role === "manager") {
      // Manager creates → auto assign to himself
      assignedManagerId = req.user.id;
      // Inherit manager's department
      const managerUser = await User.findByPk(req.user.id);
      if (managerUser) {
        assignedDepartmentId = managerUser.department_id || null;
        assignedDepartmentName = managerUser.department || null;
      }
    } else if (req.user.role === "admin") {
      // Admin creates employee → must assign manager (optional but recommended)
      if (role === "employee") {
        assignedManagerId = manager_id || null;
        if (assignedManagerId) {
          const managerUser = await User.findByPk(assignedManagerId);
          if (managerUser) {
            assignedDepartmentId = managerUser.department_id || null;
            assignedDepartmentName = managerUser.department || null;
          }
        }
      }
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      department:
        role === "employee"
          ? assignedDepartmentName || department || null
          : department || null,
      department_id:
        role === "employee"
          ? assignedDepartmentId || department_id || null
          : department_id || null,
      position: position || null,
      phone: phone || null,
      employee_id:
        role === "employee" ? employee_id || generatedEmployeeId : null,
      gender: role === "employee" ? gender || null : null,
      date_of_birth: role === "employee" ? date_of_birth || null : null,
      address: role === "employee" ? address || null : null,
      emergency_contact: role === "employee" ? emergency_contact || null : null,
      employment_type: role === "employee" ? employment_type || null : null,
      join_date: role === "employee" ? join_date || defaultJoinDate : null,
      manager_id: assignedManagerId,
      reports_to: role === "manager" ? reports_to || null : null,
      office_branch: role === "manager" ? office_branch || null : null,
      status: status || "active",
    });

    // Send account setup link (never email plaintext passwords)
    const setupToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = hashToken(setupToken);
    user.resetPasswordExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const setupUrl = `${env.frontendUrl}/reset-password?token=${setupToken}`;
    await sendCredentialsEmail(name, email, setupUrl);

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

// ================= GET EMPLOYEES (ADMIN) =================
export const getEmployees = async (req, res) => {
  try {
    const {
      search = "",
      status = "all",
      page = "1",
      limit = "8",
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = req.query;

    const parsedPage = Math.max(1, Number.parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Number.parseInt(limit, 10) || 8);

    const where = {
      role: "employee",
    };

    // Managers only see employees assigned to them
    if (req.user.role === "manager") {
      where.manager_id = req.user.id;
    }

    if (status && status !== "all") {
      where.status = String(status).toLowerCase();
    }

    const searchText = typeof search === "string" ? search.trim() : "";
    if (searchText) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${searchText}%` } },
        { email: { [Op.iLike]: `%${searchText}%` } },
        { department: { [Op.iLike]: `%${searchText}%` } },
        { position: { [Op.iLike]: `%${searchText}%` } },
      ];
    }

    const allowedSortColumns = [
      "name",
      "email",
      "department",
      "position",
      "phone",
      "createdAt",
      "status",
    ];
    const safeSortBy = allowedSortColumns.includes(sortBy)
      ? sortBy
      : "createdAt";
    const safeSortOrder =
      String(sortOrder).toUpperCase() === "ASC" ? "ASC" : "DESC";
    const dbSortBy = safeSortBy === "status" ? "createdAt" : safeSortBy;

    const offset = (parsedPage - 1) * parsedLimit;

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password"] },
      order: [[dbSortBy, safeSortOrder]],
      limit: parsedLimit,
      offset,
    });

    const totalPages = Math.max(1, Math.ceil(count / parsedLimit));

    res.json({
      data: rows,
      page: parsedPage,
      totalPages,
      total: count,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET EMPLOYEE BY ID (ADMIN) =================
export const getEmployeeById = async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid employee id" });
    }

    const employee = await User.findOne({
      where: { id, role: "employee" },
      attributes: { exclude: ["password"] },
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (req.user.role === "manager" && employee.manager_id !== req.user.id) {
      return res.status(403).json({ message: "Not allowed." });
    }

    res.json(employee);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET EMPLOYEE INSIGHTS (ADMIN) =================
export const getEmployeeInsights = async (req, res) => {
  try {
    const employeeId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      return res.status(400).json({ message: "Invalid employee id" });
    }

    const employee = await User.findOne({
      where: { id: employeeId, role: "employee" },
      attributes: ["id", "updatedAt", "manager_id"],
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Managers can only view insights for their own direct reports
    if (req.user.role === "manager" && employee.manager_id !== req.user.id) {
      return res.status(403).json({ message: "Not allowed." });
    }

    const [attendanceRows, taskRows, approvedLeaveDays, latestLeave] =
      await Promise.all([
        Attendance.findAll({
          where: { user_id: employeeId },
          order: [["date", "DESC"]],
          limit: 60,
        }),
        Task.findAll({
          where: { assignedTo: employeeId },
          attributes: [
            "id",
            "title",
            "status",
            "priority",
            "deadline",
            "completedAt",
            "createdAt",
            "updatedAt",
          ],
          order: [["updatedAt", "DESC"]],
          limit: 30,
        }),
        Leave.sum("days", {
          where: {
            userId: employeeId,
            overallStatus: "approved",
          },
        }),
        Leave.findOne({
          where: { userId: employeeId },
          attributes: ["id", "type", "createdAt", "overallStatus"],
          order: [["createdAt", "DESC"]],
        }),
      ]);

    const presentLikeCount = attendanceRows.filter((row) =>
      ["present", "late"].includes(String(row.status).toLowerCase()),
    ).length;
    const lateArrivals = attendanceRows.filter(
      (row) => String(row.status).toLowerCase() === "late",
    ).length;

    const attendancePct = attendanceRows.length
      ? Math.round((presentLikeCount / attendanceRows.length) * 100)
      : 0;

    const overtime = Math.round(
      attendanceRows.reduce((sum, row) => {
        const totalHours = Number(row.total_hours ?? 0);
        return sum + Math.max(totalHours - 8, 0);
      }, 0),
    );

    const leaveDays = Number(approvedLeaveDays ?? 0);

    const recentAttendance = attendanceRows.slice(0, 8).map((row) => {
      const rawStatus = String(row.status ?? "present").toLowerCase();
      const status =
        rawStatus === "present"
          ? "Present"
          : rawStatus === "late"
            ? "Late"
            : rawStatus === "absent"
              ? "Absent"
              : "Half Day";

      return {
        id: row.id,
        date: row.date,
        checkIn: row.check_in || "-",
        checkOut: row.check_out || "-",
        status,
      };
    });

    const pendingTasks = taskRows.filter(
      (task) => String(task.status).toLowerCase() === "pending",
    ).length;
    const inProgressTasks = taskRows.filter(
      (task) => String(task.status).toLowerCase() === "in_progress",
    ).length;
    const completedTasks = taskRows.filter(
      (task) => String(task.status).toLowerCase() === "completed",
    ).length;

    const tasks = taskRows.slice(0, 8).map((task) => {
      const status = String(task.status).toLowerCase();
      const normalizedStatus =
        status === "completed"
          ? "completed"
          : status === "in_progress"
            ? "in_progress"
            : "pending";

      const dueLabel = task.deadline
        ? `Due ${new Date(task.deadline).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}`
        : "No deadline";

      return {
        id: task.id,
        title: task.title,
        status: normalizedStatus,
        dueLabel,
      };
    });

    const timeline = [];

    const latestCheckIn = attendanceRows.find((row) => !!row.check_in);
    if (latestCheckIn) {
      timeline.push({
        id: `checkin-${latestCheckIn.id}`,
        title: "Checked in",
        detail: `Checked in at ${latestCheckIn.check_in}.`,
        timestamp: latestCheckIn.created_at || latestCheckIn.updated_at,
      });
    }

    if (latestLeave) {
      timeline.push({
        id: `leave-${latestLeave.id}`,
        title: "Leave request",
        detail: `${String(latestLeave.type).toUpperCase()} leave (${latestLeave.overallStatus}).`,
        timestamp: latestLeave.createdAt,
      });
    }

    const latestCompletedTask = taskRows.find(
      (task) => String(task.status).toLowerCase() === "completed",
    );
    if (latestCompletedTask) {
      timeline.push({
        id: `task-${latestCompletedTask.id}`,
        title: "Completed task",
        detail: latestCompletedTask.title,
        timestamp:
          latestCompletedTask.completedAt || latestCompletedTask.updatedAt,
      });
    }

    timeline.push({
      id: `profile-${employee.id}`,
      title: "Profile updated",
      detail: "Employee profile information was updated.",
      timestamp: employee.updatedAt,
    });

    const sortedTimeline = timeline
      .filter((item) => !!item.timestamp)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 8)
      .map((item) => ({
        ...item,
        timestamp: new Date(item.timestamp).toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

    return res.json({
      attendanceSummary: {
        attendancePct,
        lateArrivals,
        leaveDays,
        overtime,
      },
      recentAttendance,
      taskSummary: {
        pendingTasks,
        inProgressTasks,
        completedTasks,
      },
      tasks,
      timeline: sortedTimeline,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ================= GET MANAGERS (ADMIN) =================
export const getManagers = async (req, res) => {
  try {
    const {
      search = "",
      status = "all",
      page = "1",
      limit = "8",
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = req.query;

    const parsedPage = Math.max(1, Number.parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Number.parseInt(limit, 10) || 8);

    const where = {
      role: "manager",
    };

    if (status && status !== "all") {
      where.status = String(status).toLowerCase();
    }

    const searchText = typeof search === "string" ? search.trim() : "";
    if (searchText) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${searchText}%` } },
        { email: { [Op.iLike]: `%${searchText}%` } },
        { department: { [Op.iLike]: `%${searchText}%` } },
        { position: { [Op.iLike]: `%${searchText}%` } },
      ];
    }

    const allowedSortColumns = [
      "name",
      "email",
      "department",
      "position",
      "phone",
      "createdAt",
      "status",
    ];
    const safeSortBy = allowedSortColumns.includes(sortBy)
      ? sortBy
      : "createdAt";
    const safeSortOrder =
      String(sortOrder).toUpperCase() === "ASC" ? "ASC" : "DESC";
    const dbSortBy = safeSortBy === "status" ? "createdAt" : safeSortBy;

    const offset = (parsedPage - 1) * parsedLimit;

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password"] },
      include: [
        {
          model: User,
          as: "supervisor",
          attributes: ["id", "name"],
          required: false,
        },
      ],
      order: [[dbSortBy, safeSortOrder]],
      limit: parsedLimit,
      offset,
    });

    const data = rows.map((row) => {
      const obj = row.toJSON();
      obj.reportsTo = obj.supervisor?.name ?? null;
      delete obj.supervisor;
      return obj;
    });

    const totalPages = Math.max(1, Math.ceil(count / parsedLimit));

    res.json({
      data,
      page: parsedPage,
      totalPages,
      total: count,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET MANAGER BY ID (ADMIN) =================
export const getManagerById = async (req, res) => {
  try {
    const { id } = req.params;

    const manager = await User.findOne({
      where: { id, role: "manager" },
      attributes: { exclude: ["password"] },
      include: [
        {
          model: User,
          as: "supervisor",
          attributes: ["id", "name"],
          required: false,
        },
      ],
    });

    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    const result = manager.toJSON();
    result.reportsTo = result.supervisor?.name ?? null;
    delete result.supervisor;

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= UPDATE USER =================
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      role,
      manager_id,
      department,
      department_id,
      position,
      phone,
      gender,
      date_of_birth,
      address,
      emergency_contact,
      employment_type,
      status,
      reports_to,
      office_branch,
    } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user.role === "admin") {
      user.name = name || user.name;
      user.email = email || user.email;
      user.role = role || user.role;
      user.department = department !== undefined ? department : user.department;
      user.department_id =
        department_id !== undefined
          ? department_id || null
          : user.department_id;
      user.position = position !== undefined ? position : user.position;
      user.phone = phone !== undefined ? phone : user.phone;
      user.status = status || user.status;
      user.gender = gender !== undefined ? gender || null : user.gender;
      user.date_of_birth =
        date_of_birth !== undefined
          ? date_of_birth || null
          : user.date_of_birth;
      user.address = address !== undefined ? address || null : user.address;
      user.emergency_contact =
        emergency_contact !== undefined
          ? emergency_contact || null
          : user.emergency_contact;
      user.employment_type =
        employment_type !== undefined
          ? employment_type || null
          : user.employment_type;
      if (reports_to !== undefined) {
        user.reports_to = reports_to || null;
      }
      if (office_branch !== undefined) {
        user.office_branch = office_branch || null;
      }

      // ✅ Admin can reassign manager
      if (manager_id !== undefined) {
        user.manager_id = manager_id || null;
        // Auto-update department from new manager
        if (user.manager_id && user.role === "employee") {
          const managerUser = await User.findByPk(user.manager_id);
          if (managerUser) {
            user.department_id =
              managerUser.department_id || user.department_id;
            user.department = managerUser.department || user.department;
          }
        }
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
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "status",
        "department",
        "position",
        "phone",
        "manager_id",
        "avatar",
        "createdAt",
      ],
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Resolve manager name if present
    let managerName = null;
    if (user.manager_id) {
      const manager = await User.findByPk(user.manager_id, {
        attributes: ["name"],
      });
      managerName = manager?.name ?? null;
    }

    res.json({ ...user.toJSON(), managerName });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    await User.update({ avatar: avatarPath }, { where: { id: req.user.id } });
    res.json({ avatar: avatarPath });
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
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signAccessToken({ id: user.id, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id, role: user.role });

    user.refreshTokenHash = hashToken(refreshToken);
    user.refreshTokenExpires = new Date(Date.now() + REFRESH_TTL_MS);
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.json({
      message: "Login successful",
      token,
      accessToken: token,
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

export const refreshToken = async (req, res) => {
  try {
    const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!rawRefreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    const decoded = verifyRefreshToken(rawRefreshToken);
    const user = await User.findByPk(decoded.id);

    if (!user || !user.refreshTokenHash || !user.refreshTokenExpires) {
      clearRefreshCookie(res);
      return res.status(401).json({ message: "Invalid refresh session" });
    }

    const incomingHash = hashToken(rawRefreshToken);
    const isExpired = user.refreshTokenExpires < new Date();
    if (incomingHash !== user.refreshTokenHash || isExpired) {
      clearRefreshCookie(res);
      return res.status(401).json({ message: "Refresh token expired" });
    }

    const newAccessToken = signAccessToken({ id: user.id, role: user.role });
    const nextRefreshToken = signRefreshToken({ id: user.id, role: user.role });
    user.refreshTokenHash = hashToken(nextRefreshToken);
    user.refreshTokenExpires = new Date(Date.now() + REFRESH_TTL_MS);
    await user.save();

    setRefreshCookie(res, nextRefreshToken);

    return res.json({ accessToken: newAccessToken, token: newAccessToken });
  } catch (error) {
    clearRefreshCookie(res);
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};

export const logout = async (req, res) => {
  try {
    let userId = req.user?.id;

    if (!userId) {
      const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
      if (rawRefreshToken) {
        try {
          const decoded = verifyRefreshToken(rawRefreshToken);
          userId = decoded?.id;
        } catch {
          // Invalid refresh cookie still results in cookie clear below.
        }
      }
    }

    if (userId) {
      await User.update(
        { refreshTokenHash: null, refreshTokenExpires: null },
        { where: { id: userId } },
      );
    }

    clearRefreshCookie(res);
    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
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

    user.resetPasswordToken = hashToken(token);
    user.resetPasswordExpires = expires;
    await user.save();

    const resetUrl = `${env.frontendUrl}/reset-password?token=${token}`;
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

    const user = await User.findOne({
      where: { resetPasswordToken: hashToken(token) },
    });

    if (
      !user ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      return res
        .status(400)
        .json({ message: "Reset link is invalid or has expired." });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.refreshTokenHash = null;
    user.refreshTokenExpires = null;
    await user.save();

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
