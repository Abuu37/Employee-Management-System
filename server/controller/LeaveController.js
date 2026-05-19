import { Leave, User, LeaveBalance } from "../models/index.js";
import { Op } from "sequelize";
import { sequelize } from "../config/db.js";
import { createNotification } from "./notificationController.js";

// ================= SHARED INCLUDE =================
const leaveIncludes = [
  {
    model: User,
    as: "user",
    attributes: ["id", "name", "role", "department_id"],
  },
  { model: User, as: "backupEmployee", attributes: ["id", "name"] },
];

// ================= CENTRALIZED MAPPER =================
function mapLeave(leave) {
  return {
    id: leave.id,
    userId: leave.userId,
    employeeName: leave.user?.name ?? null,
    department_id: leave.user?.department_id ?? null,
    userRole: leave.user?.role ?? null,
    type: leave.type,
    startDate: leave.startDate,
    endDate: leave.endDate,
    days: leave.days,
    reason: leave.reason,
    backupEmployeeId: leave.backupEmployeeId ?? null,
    backupEmployeeName: leave.backupEmployee?.name ?? null,
    handoverNote: leave.handoverNote ?? null,
    managerStatus: leave.managerStatus,
    managerComment: leave.managerComment ?? null,
    managerApprovedAt: leave.managerApprovedAt ?? null,
    hrStatus: leave.hrStatus ?? null,
    hrComment: leave.hrComment ?? null,
    hrApprovedAt: leave.hrApprovedAt ?? null,
    overallStatus: leave.overallStatus,
    createdAt: leave.createdAt,
    updatedAt: leave.updatedAt,
  };
}

// ================= APPLY FOR LEAVE =================
export const applyForLeave = async (req, res) => {
  try {
    const { type, startDate, endDate, reason, backupEmployeeId, handoverNote } =
      req.body;
    const userId = req.user.id;

    const validTypes = ["annual", "sick", "casual", "emergency", "unpaid"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid leave type" });
    }

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

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const overlapping = await Leave.findOne({
      where: {
        userId,
        overallStatus: {
          [Op.in]: ["pending_manager", "pending_hr", "approved"],
        },
        [Op.and]: [
          { startDate: { [Op.lte]: endDate } },
          { endDate: { [Op.gte]: startDate } },
        ],
      },
    });

    if (overlapping) {
      return res.status(400).json({
        message: "You already have a leave request in this date range",
      });
    }

    // Managers skip manager-approval — go straight to HR
    const isManager = req.user.role === "manager";

    const leave = await Leave.create({
      userId,
      type,
      startDate,
      endDate,
      days,
      reason,
      backupEmployeeId: backupEmployeeId || null,
      handoverNote: handoverNote || null,
      managerStatus: isManager ? "approved" : "pending",
      managerApprovedAt: isManager ? new Date() : null,
      hrStatus: isManager ? "pending" : null,
      overallStatus: isManager ? "pending_hr" : "pending_manager",
    });

    res.status(201).json({ message: "Leave applied successfully", leave });

    // Notify all admins about new leave request
    const applicant = await User.findByPk(userId, {
      attributes: ["name", "department_id"],
    });
    const applicantName = applicant?.name ?? "An employee";
    const admins = await User.findAll({
      where: { role: "admin" },
      attributes: ["id"],
    });
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        title: "New Leave Request",
        message: `${applicantName} submitted a ${type} leave request for ${days} day(s).`,
        type: "leave",
        refId: leave.id,
      });
    }
    // If employee, also notify the department manager
    if (!isManager) {
      if (applicant?.department_id) {
        const mgrs = await User.findAll({
          where: { role: "manager", department_id: applicant.department_id },
          attributes: ["id"],
        });
        for (const mgr of mgrs) {
          await createNotification({
            userId: mgr.id,
            title: "New Leave Request",
            message: `${applicantName} submitted a ${type} leave request for ${days} day(s).`,
            type: "leave",
            refId: leave.id,
          });
        }
      }
    }
  } catch (error) {
    console.error("Error applying for leave:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= MANAGER: EDIT + APPLY REJECTED OWN LEAVE =================
export const managerResendRejectedLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, startDate, endDate, reason, backupEmployeeId, handoverNote } =
      req.body;
    const userId = req.user.id;

    const leave = await Leave.findByPk(id);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    const [actor, owner] = await Promise.all([
      User.findByPk(userId, {
        attributes: ["id", "role", "department_id", "name"],
      }),
      User.findByPk(leave.userId, {
        attributes: ["id", "role", "department_id", "name"],
      }),
    ]);

    const isOwner = leave.userId === userId;
    const isManagerEditingTeamRejected =
      actor?.role === "manager" &&
      owner?.role === "employee" &&
      actor.department_id != null &&
      owner?.department_id === actor.department_id;

    if (!isOwner && !isManagerEditingTeamRejected) {
      return res.status(403).json({ message: "Forbidden: not your leave" });
    }

    if (isOwner && leave.overallStatus !== "rejected_by_hr") {
      return res.status(400).json({
        message: "Only HR rejected requests can be edited and applied again",
      });
    }

    if (
      isManagerEditingTeamRejected &&
      !leave.overallStatus.startsWith("rejected")
    ) {
      return res.status(400).json({
        message:
          "Only rejected team leave requests can be edited and re-applied",
      });
    }

    const validTypes = ["annual", "sick", "casual", "emergency", "unpaid"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid leave type" });
    }

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

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const overlapping = await Leave.findOne({
      where: {
        userId,
        id: { [Op.ne]: leave.id },
        overallStatus: {
          [Op.in]: ["pending_manager", "pending_hr", "approved"],
        },
        [Op.and]: [
          { startDate: { [Op.lte]: endDate } },
          { endDate: { [Op.gte]: startDate } },
        ],
      },
    });

    if (overlapping) {
      return res.status(400).json({
        message: "You already have a leave request in this date range",
      });
    }

    let normalizedBackupEmployeeId = backupEmployeeId || null;
    if (normalizedBackupEmployeeId) {
      const [manager, backup] = await Promise.all([
        User.findByPk(userId, { attributes: ["role", "department_id"] }),
        User.findByPk(normalizedBackupEmployeeId, {
          attributes: ["id", "role", "department_id"],
        }),
      ]);

      if (!backup) {
        return res.status(400).json({ message: "Backup person not found" });
      }

      if (
        manager?.role === "manager" &&
        (backup.role !== "employee" ||
          backup.department_id !== manager.department_id)
      ) {
        return res.status(400).json({
          message: "Backup person must be from your team",
        });
      }
    }

    leave.type = type;
    leave.startDate = startDate;
    leave.endDate = endDate;
    leave.days = days;
    leave.reason = reason;
    leave.backupEmployeeId = normalizedBackupEmployeeId;
    leave.handoverNote = handoverNote || null;

    // Manager's own leave and manager-edited team rejected leave both proceed to HR queue.
    leave.managerStatus = "approved";
    leave.managerComment = null;
    leave.managerApprovedAt = new Date();
    leave.hrStatus = "pending";
    leave.hrComment = null;
    leave.hrApprovedAt = null;
    leave.overallStatus = "pending_hr";
    await leave.save();

    const savedLeave = await Leave.findByPk(leave.id, {
      include: leaveIncludes,
    });

    res.json({
      message: "Leave request updated and applied successfully",
      leave: mapLeave(savedLeave),
    });

    const requesterName = actor?.name ?? "A manager";
    const admins = await User.findAll({
      where: { role: "admin" },
      attributes: ["id"],
    });

    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        title: "Leave Request Updated",
        message: `${requesterName} edited and re-applied a ${type} leave request for ${days} day(s).`,
        type: "leave",
        refId: leave.id,
      });
    }
  } catch (error) {
    console.error("Error in managerResendRejectedLeave:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTeamLeaves = async (req, res) => {
  try {
    const {
      type,
      status,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = req.query;

    const manager = await User.findByPk(req.user.id);
    if (!manager) return res.status(404).json({ message: "Manager not found" });

    const employees = await User.findAll({
      where: { department_id: manager.department_id, role: "employee" },
      attributes: ["id"],
    });

    const employeeIds = employees.map((e) => e.id);
    if (!employeeIds.length) return res.json([]);

    const validSortFields = [
      "type",
      "startDate",
      "endDate",
      "days",
      "overallStatus",
      "createdAt",
    ];
    const orderField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const orderDir = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const where = { userId: { [Op.in]: employeeIds } };
    if (type) where.type = type;
    if (status) where.overallStatus = status;

    const leaves = await Leave.findAll({
      where,
      include: leaveIncludes,
      order: [[orderField, orderDir]],
    });

    res.json(leaves.map(mapLeave));
  } catch (error) {
    console.error("Error fetching team leaves:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= MANAGER: APPROVE LEAVE (stage 1) =================
export const managerApproveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user.id;

    const leave = await Leave.findByPk(id, { include: leaveIncludes });
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    if (leave.overallStatus !== "pending_manager") {
      return res
        .status(400)
        .json({ message: "This leave is not awaiting manager approval" });
    }

    if (req.user.role === "manager") {
      const manager = await User.findByPk(managerId);
      if (leave.user?.department_id !== manager.department_id) {
        return res
          .status(403)
          .json({ message: "Forbidden: not your department" });
      }
    }

    leave.managerStatus = "approved";
    leave.managerApprovedAt = new Date();
    leave.hrStatus = "pending";
    leave.overallStatus = "pending_hr";
    await leave.save();

    res.json({
      message: "Leave forwarded to HR for final approval",
      leave: mapLeave(leave),
    });

    // Notify the employee their leave was approved by manager
    await createNotification({
      userId: leave.userId,
      title: "Leave Approved by Manager",
      message: `Your ${leave.type} leave request has been approved by your manager and is now pending HR review.`,
      type: "leave",
      refId: leave.id,
    });

    // Notify all admins that leave is ready for HR review
    const admins = await User.findAll({
      where: { role: "admin" },
      attributes: ["id"],
    });
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        title: "Leave Pending HR Approval",
        message: `${leave.user?.name ?? "An employee"}'s ${leave.type} leave has been approved by manager and is awaiting HR review.`,
        type: "leave",
        refId: leave.id,
      });
    }
  } catch (error) {
    console.error("Error in managerApproveLeave:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const managerRejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const managerId = req.user.id;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const leave = await Leave.findByPk(id, { include: leaveIncludes });
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    if (leave.overallStatus !== "pending_manager") {
      return res
        .status(400)
        .json({ message: "This leave is not awaiting manager approval" });
    }

    if (req.user.role === "manager") {
      const manager = await User.findByPk(managerId);
      if (leave.user?.department_id !== manager.department_id) {
        return res
          .status(403)
          .json({ message: "Forbidden: not your department" });
      }
    }

    leave.managerStatus = "rejected";
    leave.managerComment = comment.trim();
    leave.managerApprovedAt = new Date();
    leave.overallStatus = "rejected_by_manager";
    await leave.save();

    res.json({ message: "Leave rejected by manager", leave: mapLeave(leave) });

    // Notify the employee their leave was rejected by manager
    await createNotification({
      userId: leave.userId,
      title: "Leave Request Rejected",
      message: `Your ${leave.type} leave request was rejected by manager. Reason: ${comment.trim()}`,
      type: "leave",
      refId: leave.id,
    });
  } catch (error) {
    console.error("Error in managerRejectLeave:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= HR: GET PENDING LEAVES (stage 2) =================
export const getHrPendingLeaves = async (req, res) => {
  try {
    const { type, sortBy = "createdAt", sortOrder = "DESC" } = req.query;

    const validSortFields = [
      "type",
      "startDate",
      "endDate",
      "days",
      "overallStatus",
      "createdAt",
    ];
    const orderField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const orderDir = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    // Only employee-submitted leaves awaiting HR approval.
    // Manager-submitted leaves are handled via the "Manager Leaves" tab.
    const employees = await User.findAll({
      where: { role: "employee" },
      attributes: ["id"],
    });
    const employeeIds = employees.map((e) => e.id);

    const where = {
      overallStatus: "pending_hr",
      userId: { [Op.in]: employeeIds },
    };
    if (type) where.type = type;

    const leaves = await Leave.findAll({
      where,
      include: leaveIncludes,
      order: [[orderField, orderDir]],
    });
    res.json(leaves.map(mapLeave));
  } catch (error) {
    console.error("Error fetching HR pending leaves:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= HR: FINAL APPROVE LEAVE (stage 2) =================
export const hrApproveLeave = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    const leave = await Leave.findByPk(id, { transaction: t });
    if (!leave) {
      await t.rollback();
      return res.status(404).json({ message: "Leave not found" });
    }

    if (leave.overallStatus !== "pending_hr") {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "This leave is not awaiting HR approval" });
    }

    const leaveBalance = await LeaveBalance.findOne({
      where: { userId: leave.userId },
      transaction: t,
    });

    if (!leaveBalance) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Leave balance not found for employee" });
    }

    let available = 0;
    if (leave.type === "annual") available = leaveBalance.annual;
    else if (leave.type === "sick") available = leaveBalance.sick;
    else if (leave.type === "casual") available = leaveBalance.casual;
    else available = Infinity; // emergency / unpaid have no balance constraint

    if (leave.days > available) {
      await t.rollback();
      return res.status(400).json({
        message: `Insufficient ${leave.type} leave balance. Available: ${available} days, Requested: ${leave.days} days.`,
      });
    }

    leave.hrStatus = "approved";
    leave.hrApprovedAt = new Date();
    leave.overallStatus = "approved";
    await leave.save({ transaction: t });

    if (leave.type === "annual") leaveBalance.annual -= leave.days;
    else if (leave.type === "sick") leaveBalance.sick -= leave.days;
    else if (leave.type === "casual") leaveBalance.casual -= leave.days;

    await leaveBalance.save({ transaction: t });
    await t.commit();

    res.json({ message: "Leave approved by HR", leave });

    // Notify the employee
    await createNotification({
      userId: leave.userId,
      title: "Leave Approved ✓",
      message: `Your ${leave.type} leave request has been approved by HR.`,
      type: "leave",
      refId: leave.id,
    });
  } catch (error) {
    console.error("Error in hrApproveLeave:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const hrRejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const leave = await Leave.findByPk(id);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    if (leave.overallStatus !== "pending_hr") {
      return res
        .status(400)
        .json({ message: "This leave is not awaiting HR approval" });
    }

    leave.hrStatus = "rejected";
    leave.hrComment = comment.trim();
    leave.hrApprovedAt = new Date();
    leave.overallStatus = "rejected_by_hr";
    await leave.save();

    res.json({ message: "Leave rejected by HR", leave });

    // Notify the employee
    await createNotification({
      userId: leave.userId,
      title: "Leave Request Rejected",
      message: `Your ${leave.type} leave request was rejected by HR. Reason: ${comment.trim()}`,
      type: "leave",
      refId: leave.id,
    });
  } catch (error) {
    console.error("Error in hrRejectLeave:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getLeaveApplications = async (req, res) => {
  try {
    const leaves = await Leave.findAll({
      include: leaveIncludes,
      order: [["createdAt", "DESC"]],
    });
    res.json(leaves.map(mapLeave));
  } catch (error) {
    console.error("Error fetching all leaves:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= GET MANAGER LEAVES (Admin view of manager-role leaves) =================
export const getManagerLeaves = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const {
      type,
      status,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = req.query;

    const validSortFields = [
      "type",
      "startDate",
      "endDate",
      "days",
      "overallStatus",
      "createdAt",
    ];
    const orderField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const orderDir = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const managers = await User.findAll({
      where: { role: "manager" },
      attributes: ["id"],
    });
    const managerIds = managers.map((m) => m.id);

    const where = { userId: { [Op.in]: managerIds } };
    if (type) where.type = type;
    if (status) where.overallStatus = status;

    const leaves = await Leave.findAll({
      where,
      include: leaveIncludes,
      order: [[orderField, orderDir]],
    });
    res.json(leaves.map(mapLeave));
  } catch (error) {
    console.error("Error fetching manager leaves:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= GET MY LEAVES =================
export const getMyLeaves = async (req, res) => {
  try {
    const {
      type,
      status,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = req.query;

    const validSortFields = [
      "type",
      "startDate",
      "endDate",
      "days",
      "overallStatus",
      "createdAt",
    ];
    const orderField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const orderDir = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const where = { userId: req.user.id };
    if (type) where.type = type;
    if (status) where.overallStatus = status;

    const leaves = await Leave.findAll({
      where,
      include: leaveIncludes,
      order: [[orderField, orderDir]],
    });
    res.json(leaves.map(mapLeave));
  } catch (error) {
    console.error("Error fetching my leaves:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= GET LEAVE STATS =================
export const getLeaveStats = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;
    const scope = String(req.query.scope || "").toLowerCase();

    let where = {};

    if (role === "employee") {
      where.userId = userId;
    } else if (role === "manager") {
      const manager = await User.findByPk(userId);
      if (!manager) {
        return res.status(404).json({ message: "Manager not found" });
      }

      const employees = await User.findAll({
        where: { department_id: manager.department_id, role: "employee" },
        attributes: ["id"],
      });

      const employeeIds = employees.map((e) => e.id);
      if (scope === "team") {
        where.userId = { [Op.in]: employeeIds.length ? employeeIds : [-1] };
      } else if (scope === "my") {
        where.userId = userId;
      } else {
        // Default manager scope: all leave requests visible to manager
        // (own leaves + department employee leaves).
        const visibleUserIds = [userId, ...employeeIds];
        where.userId = { [Op.in]: visibleUserIds };
      }
    } else if (role === "admin") {
      if (scope === "hr_pending") {
        const employees = await User.findAll({
          where: { role: "employee" },
          attributes: ["id"],
        });
        const employeeIds = employees.map((e) => e.id);
        where.userId = { [Op.in]: employeeIds.length ? employeeIds : [-1] };
      } else if (scope === "manager") {
        const managers = await User.findAll({
          where: { role: "manager" },
          attributes: ["id"],
        });
        const managerIds = managers.map((m) => m.id);
        where.userId = { [Op.in]: managerIds.length ? managerIds : [-1] };
      }
    }
    // admin: no userId filter → all leaves

    const [total, approved, pending, rejected] = await Promise.all([
      Leave.count({ where }),
      Leave.count({ where: { ...where, overallStatus: "approved" } }),
      Leave.count({
        where: {
          ...where,
          overallStatus: { [Op.in]: ["pending_manager", "pending_hr"] },
        },
      }),
      Leave.count({
        where: {
          ...where,
          overallStatus: { [Op.in]: ["rejected_by_manager", "rejected_by_hr"] },
        },
      }),
    ]);

    res.json({ total, approved, pending, rejected });
  } catch (error) {
    console.error("Error fetching leave stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= GET LEAVE BALANCE =================
export const getLeaveBalance = async (req, res) => {
  try {
    const DEFAULT_BALANCE = {
      annual: 20,
      sick: 10,
      casual: 5,
    };

    let leaveBalance = await LeaveBalance.findOne({
      where: { userId: req.user.id },
    });

    // Auto-create a default balance record if none exists
    if (!leaveBalance) {
      leaveBalance = await LeaveBalance.create({
        userId: req.user.id,
        annual: DEFAULT_BALANCE.annual,
        sick: DEFAULT_BALANCE.sick,
        casual: DEFAULT_BALANCE.casual,
      });
    }

    // Self-heal balance based on currently approved leaves only.
    // This guarantees pending/rejected leaves do not affect remaining balance.
    const approvedLeaves = await Leave.findAll({
      where: {
        userId: req.user.id,
        overallStatus: "approved",
      },
      attributes: ["type", "days"],
    });

    //====== Calculate used days by type and adjust balance accordingly ======//
    const used = { annual: 0, sick: 0, casual: 0 };
    for (const leave of approvedLeaves) {
      if (leave.type === "annual") used.annual += leave.days;
      else if (leave.type === "sick") used.sick += leave.days;
      else if (leave.type === "casual") used.casual += leave.days;
    }

    //==== Recalculate available balance based on status changes====//

    const recalculated = {
      annual: Math.max(0, DEFAULT_BALANCE.annual - used.annual),
      sick: Math.max(0, DEFAULT_BALANCE.sick - used.sick),
      casual: Math.max(0, DEFAULT_BALANCE.casual - used.casual),
    };

    if (
      leaveBalance.annual !== recalculated.annual ||
      leaveBalance.sick !== recalculated.sick ||
      leaveBalance.casual !== recalculated.casual
    ) {
      leaveBalance.annual = recalculated.annual;
      leaveBalance.sick = recalculated.sick;
      leaveBalance.casual = recalculated.casual;
      await leaveBalance.save();
    }

    res.json({
      message: "Leave balance fetched successfully",
      balance: {
        annual: recalculated.annual,
        sick: recalculated.sick,
        casual: recalculated.casual,
      },
    });
  } catch (error) {
    console.error("Error fetching leave balance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= CANCEL LEAVE =================
export const cancelLeave = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const leave = await Leave.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "role", "department_id"],
        },
      ],
      transaction: t,
    });

    if (!leave) {
      await t.rollback();
      return res.status(404).json({ message: "Leave not found" });
    }

    const actor = await User.findByPk(req.user.id, {
      attributes: ["id", "role", "department_id"],
      transaction: t,
    });

    const isOwner = leave.userId === req.user.id;
    const isManagerDeletingTeamRejected =
      actor?.role === "manager" &&
      leave.user?.role === "employee" &&
      actor.department_id != null &&
      leave.user?.department_id === actor.department_id;

    if (!isOwner && !isManagerDeletingTeamRejected) {
      await t.rollback();
      return res.status(403).json({ message: "Forbidden" });
    }

    // Pending and rejected leaves can be deleted without balance changes.
    // Approved leaves can be cancelled with balance restoration.
    const cancellable = isOwner
      ? leave.overallStatus === "pending_manager" ||
        leave.overallStatus === "pending_hr" ||
        leave.overallStatus === "approved" ||
        leave.overallStatus === "rejected_by_manager" ||
        leave.overallStatus === "rejected_by_hr"
      : leave.overallStatus.startsWith("rejected");

    if (!cancellable) {
      await t.rollback();
      return res.status(400).json({
        message: isOwner
          ? "Only pending, approved, or rejected leaves can be deleted."
          : "Only rejected team leave requests can be deleted.",
      });
    }

    if (leave.overallStatus === "approved") {
      const leaveBalance = await LeaveBalance.findOne({
        where: { userId: leave.userId },
        transaction: t,
      });

      if (!leaveBalance) {
        await t.rollback();
        return res
          .status(400)
          .json({ message: "Leave balance not found for employee" });
      }

      if (leave.type === "annual") leaveBalance.annual += leave.days;
      else if (leave.type === "sick") leaveBalance.sick += leave.days;
      else if (leave.type === "casual") leaveBalance.casual += leave.days;

      await leaveBalance.save({ transaction: t });
    }

    await leave.destroy({ transaction: t });
    await t.commit();

    res.json({
      message:
        leave.overallStatus === "approved"
          ? "Approved leave cancelled and balance restored successfully"
          : leave.overallStatus.startsWith("rejected")
            ? "Rejected leave deleted successfully"
            : "Leave cancelled successfully",
    });
  } catch (error) {
    await t.rollback();
    console.error("Error cancelling leave:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= GET LEAVES BY USER =================
export const getLeavesByUser = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId)
      return res.status(400).json({ message: "User ID is required" });

    const leaves = await Leave.findAll({
      where: { userId },
      include: leaveIncludes,
      order: [["createdAt", "DESC"]],
    });
    res.json(leaves.map(mapLeave));
  } catch (error) {
    console.error("Error fetching leaves by user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= GET LEAVES BY DATE RANGE =================
export const getLeavesByDateRange = async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res
        .status(400)
        .json({ message: "Start and end dates are required" });
    }
    const leaves = await Leave.findAll({
      where: { startDate: { [Op.gte]: start }, endDate: { [Op.lte]: end } },
      include: leaveIncludes,
      order: [["startDate", "ASC"]],
    });
    res.json(leaves.map(mapLeave));
  } catch (error) {
    console.error("Error fetching leaves by date range:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= GET LEAVES BY OVERALL STATUS =================
export const getLeavesByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    if (!status) return res.status(400).json({ message: "Status is required" });

    const leaves = await Leave.findAll({
      where: { overallStatus: status },
      include: leaveIncludes,
      order: [["createdAt", "DESC"]],
    });
    res.json(leaves.map(mapLeave));
  } catch (error) {
    console.error("Error fetching leaves by status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
