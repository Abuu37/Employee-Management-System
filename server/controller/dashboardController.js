import User from "../models/user.js";
import Task from "../models/task.js";
import Project from "../models/project.js";
import Leave from "../models/Leave.js";
import Document from "../models/document.js";
import Payroll from "../models/payroll.js";
import { sequelize } from "../config/db.js";
import { Op } from "sequelize";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function buildMonthRange() {
  const map = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    map[key] = { month: MONTHS[d.getMonth()] };
  }
  return map;
}

export const getDashboardSummary = async (req, res) => {
  try {
    const isManager = req.user.role === "manager";
    const isEmployee = req.user.role === "employee";
    const userId = req.user.id;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    let teamMemberIds = [];
    if (isManager) {
      const teamMembers = await User.findAll({
        attributes: ["id"],
        where: { manager_id: userId, role: "employee" },
        raw: true,
      });
      teamMemberIds = teamMembers.map((u) => u.id);
    }

    const teamIdList = teamMemberIds.length ? teamMemberIds : [0];
    const taskWhere = isManager
      ? { assigned_to: { [Op.in]: teamIdList } }
      : isEmployee
        ? { assigned_to: userId }
        : {};
    const leaveWhere = isManager
      ? { user_id: { [Op.in]: teamIdList } }
      : isEmployee
        ? { user_id: userId }
        : {};
    const projectWhere = isManager ? { manager_id: userId } : {};

    const [
      totalEmployees,
      totalManagers,
      totalProjects,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
    ] = await Promise.all([
      isManager
        ? User.count({ where: { manager_id: userId, role: "employee" } })
        : isEmployee
          ? Promise.resolve(0)
          : User.count({ where: { role: "employee" } }),
      isEmployee
        ? Promise.resolve(0)
        : User.count({ where: { role: "manager" } }),
      isEmployee
        ? Task.count({
            col: "project_id",
            distinct: true,
            where: { assigned_to: userId, project_id: { [Op.ne]: null } },
          })
        : isManager
          ? Project.count({ where: projectWhere })
          : Project.count(),
      Task.count({ where: { status: "pending", ...taskWhere } }),
      Task.count({ where: { status: "in_progress", ...taskWhere } }),
      Task.count({ where: { status: "completed", ...taskWhere } }),
      Leave.count({ where: { status: "pending", ...leaveWhere } }),
      Leave.count({ where: { status: "approved", ...leaveWhere } }),
      Leave.count({ where: { status: "rejected", ...leaveWhere } }),
    ]);

    const monthlyTasks = await Task.findAll({
      attributes: [
        [sequelize.literal("YEAR(createdAt)"), "year"],
        [sequelize.literal("MONTH(createdAt)"), "month"],
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where: { createdAt: { [Op.gte]: sixMonthsAgo }, ...taskWhere },
      group: [
        sequelize.literal("YEAR(createdAt)"),
        sequelize.literal("MONTH(createdAt)"),
        "status",
      ],
      raw: true,
    });

    const taskMonthMap = buildMonthRange();
    Object.values(taskMonthMap).forEach((v) => {
      v.completed = 0;
      v.pending = 0;
    });
    monthlyTasks.forEach((r) => {
      const key = `${r.year}-${r.month}`;
      if (taskMonthMap[key]) {
        if (r.status === "completed")
          taskMonthMap[key].completed = parseInt(r.count);
        else
          taskMonthMap[key].pending =
            (taskMonthMap[key].pending || 0) + parseInt(r.count);
      }
    });
    const taskTrend = Object.values(taskMonthMap);

    const [monthlyProjects, monthlyLeaves] = await Promise.all([
      Project.findAll({
        attributes: [
          [sequelize.literal("YEAR(createdAt)"), "year"],
          [sequelize.literal("MONTH(createdAt)"), "month"],
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        where: { createdAt: { [Op.gte]: sixMonthsAgo }, ...projectWhere },
        group: [
          sequelize.literal("YEAR(createdAt)"),
          sequelize.literal("MONTH(createdAt)"),
        ],
        raw: true,
      }),
      Leave.findAll({
        attributes: [
          [sequelize.literal("YEAR(created_at)"), "year"],
          [sequelize.literal("MONTH(created_at)"), "month"],
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        where: { createdAt: { [Op.gte]: sixMonthsAgo }, ...leaveWhere },
        group: [
          sequelize.literal("YEAR(created_at)"),
          sequelize.literal("MONTH(created_at)"),
        ],
        raw: true,
      }),
    ]);

    const areaMap = buildMonthRange();
    Object.values(areaMap).forEach((v) => {
      v.projects = 0;
      v.leaves = 0;
    });
    monthlyProjects.forEach((r) => {
      const key = `${r.year}-${r.month}`;
      if (areaMap[key]) areaMap[key].projects = parseInt(r.count);
    });
    monthlyLeaves.forEach((r) => {
      const key = `${r.year}-${r.month}`;
      if (areaMap[key]) areaMap[key].leaves = parseInt(r.count);
    });
    const areaTrend = Object.values(areaMap);

    const taskDistribution = [
      { name: "Pending", value: pendingTasks },
      { name: "In Progress", value: inProgressTasks },
      { name: "Completed", value: completedTasks },
    ];

    const leaveDistribution = [
      { name: "Pending", value: pendingLeaves },
      { name: "Approved", value: approvedLeaves },
      { name: "Rejected", value: rejectedLeaves },
    ];

    const payrollWhere = isManager
      ? { user_id: { [Op.in]: teamIdList } }
      : isEmployee
        ? { user_id: userId }
        : {};
    const monthlyPayroll = await Payroll.findAll({
      attributes: [
        "year",
        "month",
        [sequelize.fn("SUM", sequelize.col("net_salary")), "totalNet"],
        [sequelize.fn("SUM", sequelize.col("base_salary")), "totalBase"],
      ],
      where: payrollWhere,
      group: ["year", "month"],
      order: [
        ["year", "ASC"],
        ["month", "ASC"],
      ],
      raw: true,
    });

    const payrollMap = buildMonthRange();
    Object.values(payrollMap).forEach((v) => {
      v.totalNet = 0;
      v.totalBase = 0;
    });
    monthlyPayroll.forEach((r) => {
      const key = `${r.year}-${r.month}`;
      if (payrollMap[key]) {
        payrollMap[key].totalNet = parseFloat(r.totalNet ?? 0);
        payrollMap[key].totalBase = parseFloat(r.totalBase ?? 0);
      }
    });
    const payrollTrend = Object.values(payrollMap);

    const docWhere = isManager
      ? { user_id: { [Op.in]: teamIdList } }
      : isEmployee
        ? { user_id: userId }
        : {};
    const docs = await Document.findAll({
      where: docWhere,
      include: [
        { model: User, as: "owner", attributes: ["name"] },
        { model: User, as: "uploader", attributes: ["name"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: 3,
      raw: true,
      nest: true,
    });

    const recentDocuments = docs.map((d) => ({
      id: d.id,
      fileName: d.file_name,
      fileType: d.file_type,
      visibility: d.visibility,
      isVerified: d.is_verified,
      owner: d.owner?.name ?? "-",
      uploader: d.uploader?.name ?? "-",
      uploadedAt: d.createdAt,
    }));

    const overdueTasks = await Task.findAll({
      include: [{ model: User, as: "assigner", attributes: ["name"] }],
      where: {
        status: { [Op.ne]: "completed" },
        deadline: { [Op.lt]: new Date() },
        ...taskWhere,
      },
      order: [["deadline", "ASC"]],
      limit: 5,
      raw: true,
      nest: true,
    });

    const recentTasks = await Task.findAll({
      include: [{ model: User, as: "assigner", attributes: ["name"] }],
      where: taskWhere,
      order: [["createdAt", "DESC"]],
      limit: 4,
      raw: true,
      nest: true,
    });

    res.json({
      summary: {
        totalEmployees,
        totalManagers,
        totalProjects,
        tasks: {
          pending: pendingTasks,
          in_progress: inProgressTasks,
          completed: completedTasks,
        },
        leaves: { pending: pendingLeaves },
      },
      taskTrend,
      areaTrend,
      taskDistribution,
      leaveDistribution,
      payrollTrend,
      recentDocuments,
      overdueTasks: overdueTasks.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        assigner: t.assigner?.name ?? "-",
        deadline: t.deadline,
      })),
      recentTasks: recentTasks.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        assigner: t.assigner?.name ?? "-",
        deadline: t.deadline,
      })),
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
