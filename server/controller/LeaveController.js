// Centralized leave mapping
function mapLeave(leave) {
  return {
    id: leave.id,
    userId: leave.userId,
    department_id: leave.user?.department_id,
    employeeName: leave.user?.name,
    type: leave.type,
    startDate: leave.startDate,
    endDate: leave.endDate,
    days: leave.days,
    reason: leave.reason,
    status: leave.status,
    approvedBy: leave.approver?.name,
    approvedAt: leave.approvedAt,
    userRole: leave.user?.role,
    createdAt: leave.createdAt,
    updatedAt: leave.updatedAt,
  };
}

// ...existing code...

// ...existing code...

// GET /api/leaves/manager-leaves (for admin to approve manager leaves)
export const getManagerLeaves = async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Forbidden" });
  const managers = await User.findAll({
    where: { role: "manager" },
    attributes: ["id"],
  });
  const managerIds = managers.map((m) => m.id);
  const leaves = await Leave.findAll({
    where: { userId: { [Op.in]: managerIds } },
    include: [
      { model: User, as: "user", attributes: ["id", "name", "role"] },
      { model: User, as: "approver", attributes: ["id", "name"] },
    ],
    order: [["createdAt", "DESC"]],
  });
  res.json(leaves.map(mapLeave));
};

// ...existing code...
import { Leave, User, LeaveBalance } from "../models/index.js";
import { Op } from "sequelize";
import Holiday from "../models/Holiday.js";
import { sequelize } from "../config/db.js";

// ================= APPLY FOR LEAVE =================
export const applyForLeave = async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    const userId = req.user.id;

    // ✅ Validate leave type
    const validTypes = ["annual", "sick", "casual"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid leave type" });
    }

    // ✅ Validate dates
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Start and end dates are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (end < start) {
      return res
        .status(400)
        .json({ message: "End date must be after start date" });
    }

    // ✅ Calculate days
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // ✅ Check overlapping leaves
    const overlappingLeave = await Leave.findOne({
      where: {
        userId,
        status: {
          [Op.in]: ["pending", "approved"],
        },
        [Op.and]: [
          { startDate: { [Op.lte]: endDate } },
          { endDate: { [Op.gte]: startDate } },
        ],
      },
    });

    if (overlappingLeave) {
      return res.status(400).json({
        message: "You already have a leave in this date range",
      });
    }

    // ✅ Get leave balance
    const leaveBalance = await LeaveBalance.findOne({ where: { userId } });

    if (!leaveBalance) {
      return res.status(400).json({ message: "Leave balance not initialized" });
    }

    // ✅ Check available days
    let availableDays = 0;
    if (type === "annual") availableDays = leaveBalance.annual;
    else if (type === "sick") availableDays = leaveBalance.sick;
    else if (type === "casual") availableDays = leaveBalance.casual;

    if (days > availableDays) {
      return res.status(400).json({
        message: `Insufficient ${type} leave balance. Available: ${availableDays} days, Requested: ${days} days.`,
      });
    }

    // ✅ Create leave
    const leave = await Leave.create({
      userId,
      type,
      startDate,
      endDate,
      reason,
      days,
      status: "pending",
    });

    res.status(201).json({ message: "Leave applied successfully", leave });
  } catch (error) {
    console.error("Error applying for leave:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= GET ALL LEAVES =================
export const getLeaveApplications = async (req, res) => {
  try {
    const leaves = await Leave.findAll({
      include: [
        { model: User, as: "user", attributes: ["id", "name", "role"] },
        { model: User, as: "approver", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    const result = leaves.map((leave) => ({
      id: leave.id,
      type: leave.type,
      startDate: leave.startDate,
      endDate: leave.endDate,
      days: leave.days,
      reason: leave.reason,
      status: leave.status,
      employeeName: leave.user?.name || null,
      approvedBy: leave.approver?.name || null,
      approvedAt: leave.approvedAt || null,
      userRole: leave.user?.role || null,
      createdAt: leave.createdAt,
      updatedAt: leave.updatedAt,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching leaves:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= APPROVE LEAVE =================
export const approveLeave = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    const leave = await Leave.findByPk(id, { transaction: t });

    if (!leave) {
      await t.rollback();
      return res.status(404).json({ message: "Leave not found" });
    }

    if (leave.status !== "pending") {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Only pending leaves can be approved" });
    }

    const leaveBalance = await LeaveBalance.findOne({
      where: { userId: leave.userId },
      transaction: t,
    });

    if (!leaveBalance) {
      await t.rollback();
      return res.status(400).json({ message: "Leave balance not found" });
    }

    let available = 0;
    if (leave.type === "annual") available = leaveBalance.annual;
    else if (leave.type === "sick") available = leaveBalance.sick;
    else if (leave.type === "casual") available = leaveBalance.casual;

    if (leave.days > available) {
      await t.rollback();
      return res.status(400).json({
        message: "Insufficient leave balance at approval time",
      });
    }

    // ✅ Update leave first
    leave.status = "approved";
    leave.approvedBy = req.user.id;
    leave.approvedAt = new Date();
    await leave.save({ transaction: t });

    // ✅ Then deduct balance
    if (leave.type === "annual") leaveBalance.annual -= leave.days;
    else if (leave.type === "sick") leaveBalance.sick -= leave.days;
    else if (leave.type === "casual") leaveBalance.casual -= leave.days;

    await leaveBalance.save({ transaction: t });

    await t.commit();

    res.status(200).json({ message: "Leave approved successfully", leave });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= REJECT LEAVE =================
export const rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findByPk(id);

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    if (leave.status !== "pending") {
      return res.status(400).json({
        message: "Only pending leaves can be rejected",
      });
    }

    leave.status = "rejected";
    leave.approvedBy = req.user.id; // who rejected
    leave.approvedAt = new Date(); // when rejected
    await leave.save();

    res.status(200).json({ message: "Leave rejected successfully", leave });
  } catch (error) {
    console.error("Error rejecting leave:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//================= GET TEAM LEAVES (MANAGER) =================
// ================= GET TEAM LEAVES (MANAGER) =================
export const getTeamLeaves = async (req, res) => {
  try {
    const manager = await User.findByPk(req.user.id);

    if (!manager) {
      return res.status(404).json({
        message: "Manager not found",
      });
    }

    // get employees in same department
    const employees = await User.findAll({
      where: {
        department_id: manager.department_id,
        role: "employee", // directly filter here
      },
      attributes: ["id"],
    });

    const employeeIds = employees.map((emp) => emp.id);

    // if no employees
    if (!employeeIds.length) {
      return res.json([]);
    }

    const leaves = await Leave.findAll({
      where: {
        userId: {
          [Op.in]: employeeIds,
        },
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "role", "department_id"],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(leaves.map(mapLeave));
  } catch (error) {
    console.error("Error fetching team leaves:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// ================= GET MY LEAVES =================
export const getMyLeaves = async (req, res) => {
  try {
    const userId = req.user.id;

    const leaves = await Leave.findAll({
      where: { userId },
      include: [
        { model: User, as: "user", attributes: ["id", "name", "role"] },
        { model: User, as: "approver", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(leaves.map(mapLeave));
  } catch (error) {
    console.error("Error fetching my leaves:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= GET LEAVE BALANCE =================
export const getLeaveBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    const leaveBalance = await LeaveBalance.findOne({ where: { userId } });

    if (!leaveBalance) {
      return res.status(404).json({ message: "Leave balance not found" });
    }

    res.status(200).json({
      message: "Leave balance fetched successfully",
      balance: {
        annual: leaveBalance.annual,
        sick: leaveBalance.sick,
        casual: leaveBalance.casual,
      },
    });
  } catch (error) {
    console.error("Error fetching leave balance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= GET LEAVES BY USER =================
export const getLeavesByUser = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res
        .status(400)
        .json({ message: "User ID not found" });
    }
    const leaves = await Leave.findAll({
      where: { userId },
      include: [
        { model: User, as: "user", attributes: ["id", "name", "role"] },
        { model: User, as: "approver", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(leaves);
  } catch (error) {
    console.error("Error fetching leaves by user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= GET LEAVES BY STATUS =================
export const getLeavesByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    if (!status) {
      return res
        .status(400)
        .json({ message: "Status not found" });
    }
    const leaves = await Leave.findAll({
      where: { status },
      include: [
        { model: User, as: "user", attributes: ["id", "name", "role"] },
        { model: User, as: "approver", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(leaves);
  } catch (error) {
    console.error("Error fetching leaves by status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// ================= GET LEAVES BY DATE RANGE =================
export const getLeavesByDateRange = async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({
        message: "Start and end dates are required.",
      });
    }
    const leaves = await Leave.findAll({
      where: {
        startDate: { [Op.gte]: start },
        endDate: { [Op.lte]: end },
      },
      include: [
        { model: User, as: "user", attributes: ["id", "name", "role"] },
        { model: User, as: "approver", attributes: ["id", "name"] },
      ],
      order: [["startDate", "ASC"]],
    });
    res.status(200).json(leaves);
  } catch (error) {
    console.error("Error fetching leaves by date range:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= CANCEL LEAVE =================
export const cancelLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const leave = await Leave.findOne({ where: { id, userId } });

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    if (leave.status !== "pending") {
      return res.status(400).json({
        message: "Only pending leaves can be cancelled",
      });
    }

    await leave.destroy();

    res.status(200).json({ message: "Leave cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling leave:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
