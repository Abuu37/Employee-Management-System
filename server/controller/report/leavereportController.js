// controller/report/leaveReportController.js

import { fn, col, literal, Op } from "sequelize";

import Leave from "../../models/Leave.js";
import LeaveBalance from "../../models/LeaveBalance.js";
import User from "../../models/user.js";
import Department from "../../models/Department.js";

import { buildLeaveFilters } from "./helpers/buildLeaveFilters.js";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const EXCLUDED_FIELDS = [
  "password",
  "resetPasswordToken",
  "resetPasswordExpires",
  "refreshTokenHash",
];

// ─────────────────────────────────────────────
// Shared includes
// ─────────────────────────────────────────────

const buildLeaveUserInclude = (
  department_id,
  search,
  withDisplayAttributes = true,
) => {
  const where = {};

  if (department_id) {
    where.department_id = Number(department_id);
  }

  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
      { employee_id: { [Op.iLike]: `%${search}%` } },
    ];
  }

  return {
    model: User,
    as: "user",
    attributes: withDisplayAttributes
      ? ["id", "name", "email", "employee_id", "position"]
      : [],
    required: Boolean(department_id || search),
    ...(Object.keys(where).length ? { where } : {}),
    include: [
      {
        model: Department,
        as: "dept",
        attributes: withDisplayAttributes ? ["id", "name", "code"] : [],
        required: false,
      },
    ],
  };
};

// ─────────────────────────────────────────────
// Role-based scoping helpers
// ─────────────────────────────────────────────

const applyRoleScope = (req, where) => {
  if (req.user?.role === "employee") {
    return { ...where, userId: req.user.id };
  }
  return where;
};

const applyManagerScope = (req, userInclude) => {
  if (req.user?.role !== "manager") return userInclude;
  return {
    ...userInclude,
    where: { ...userInclude.where, manager_id: req.user.id },
    required: true,
  };
};

// ─────────────────────────────────────────────
// 1. Leave Summary  (per-employee aggregation)
//    GET /api/reports/leaves/summary
//    Query: dateFrom, dateTo, type, status, userId, department_id
// ─────────────────────────────────────────────

export const getLeaveSummary = async (req, res) => {
  try {
    const { department_id, search } = req.query;

    const where = applyRoleScope(req, buildLeaveFilters(req.query));

    const userInclude = applyManagerScope(
      req,
      buildLeaveUserInclude(department_id, search),
    );

    const rows = await Leave.findAll({
      where,
      attributes: [
        "userId",
        [fn("COUNT", col("Leave.id")), "total_leaves"],
        [
          fn(
            "SUM",
            literal(
              `CASE WHEN "Leave"."overall_status" = 'approved' THEN 1 ELSE 0 END`,
            ),
          ),
          "approved",
        ],
        [
          fn(
            "SUM",
            literal(
              `CASE WHEN "Leave"."overall_status" IN ('pending_manager','pending_hr') THEN 1 ELSE 0 END`,
            ),
          ),
          "pending",
        ],
        [
          fn(
            "SUM",
            literal(
              `CASE WHEN "Leave"."overall_status" IN ('rejected_by_manager','rejected_by_hr') THEN 1 ELSE 0 END`,
            ),
          ),
          "rejected",
        ],
        [
          fn(
            "SUM",
            literal(
              `CASE WHEN "Leave"."overall_status" = 'approved' THEN "Leave"."days" ELSE 0 END`,
            ),
          ),
          "approved_days",
        ],
        [fn("SUM", col("Leave.days")), "total_days_requested"],
      ],
      include: [userInclude],
      group: ["Leave.user_id", "user.id", "user->dept.id"],
      order: [[col("user.name"), "ASC"]],
      subQuery: false,
    });

    return res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error("[LeaveSummary]", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to generate leave summary" });
  }
};

// ─────────────────────────────────────────────
// 2. Leave Details  (paginated individual records)
//    GET /api/reports/leaves/details
//    Query: dateFrom, dateTo, type, status, userId, department_id, page, limit
// ─────────────────────────────────────────────

export const getLeaveDetails = async (req, res) => {
  try {
    const { department_id, search, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const offset = (pageNum - 1) * limitNum;

    const where = applyRoleScope(req, buildLeaveFilters(req.query));

    const userInclude = applyManagerScope(
      req,
      buildLeaveUserInclude(department_id, search),
    );

    const backupInclude = {
      model: User,
      as: "backupEmployee",
      attributes: ["id", "name", "email"],
      required: false,
    };

    const { count, rows } = await Leave.findAndCountAll({
      where,
      include: [userInclude, backupInclude],
      order: [["startDate", "DESC"]],
      limit: limitNum,
      offset,
      distinct: true,
      subQuery: false,
    });

    const totalPages = Math.ceil(count / limitNum);

    return res.json({
      success: true,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
      data: rows,
    });
  } catch (error) {
    console.error("[LeaveDetails]", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch leave details" });
  }
};

// ─────────────────────────────────────────────
// 3. Leave Trends  (monthly chart data)
//    GET /api/reports/leaves/trends
//    Query: dateFrom, dateTo, type, status, department_id
// ─────────────────────────────────────────────

export const getLeaveTrends = async (req, res) => {
  try {
    const { department_id, search } = req.query;

    const where = applyRoleScope(req, buildLeaveFilters(req.query));

    const needsJoin =
      req.user?.role === "manager" || Boolean(department_id) || Boolean(search);
    const includeClause = needsJoin
      ? [
          applyManagerScope(
            req,
            buildLeaveUserInclude(department_id, search, false),
          ),
        ]
      : [];

    const monthExpr = fn("DATE_TRUNC", "month", col("Leave.start_date"));

    const rows = await Leave.findAll({
      where,
      attributes: [
        [monthExpr, "month"],
        [fn("COUNT", col("Leave.id")), "total"],
        [
          fn(
            "SUM",
            literal(
              `CASE WHEN "Leave"."overall_status" = 'approved' THEN 1 ELSE 0 END`,
            ),
          ),
          "approved",
        ],
        [
          fn(
            "SUM",
            literal(
              `CASE WHEN "Leave"."overall_status" IN ('pending_manager','pending_hr') THEN 1 ELSE 0 END`,
            ),
          ),
          "pending",
        ],
        [
          fn(
            "SUM",
            literal(
              `CASE WHEN "Leave"."overall_status" IN ('rejected_by_manager','rejected_by_hr') THEN 1 ELSE 0 END`,
            ),
          ),
          "rejected",
        ],
        [
          fn(
            "SUM",
            literal(
              `CASE WHEN "Leave"."overall_status" = 'approved' THEN "Leave"."days" ELSE 0 END`,
            ),
          ),
          "approved_days",
        ],
        [
          fn(
            "SUM",
            literal(`CASE WHEN "Leave"."type" = 'annual'    THEN 1 ELSE 0 END`),
          ),
          "annual",
        ],
        [
          fn(
            "SUM",
            literal(`CASE WHEN "Leave"."type" = 'sick'      THEN 1 ELSE 0 END`),
          ),
          "sick",
        ],
        [
          fn(
            "SUM",
            literal(`CASE WHEN "Leave"."type" = 'casual'    THEN 1 ELSE 0 END`),
          ),
          "casual",
        ],
        [
          fn(
            "SUM",
            literal(`CASE WHEN "Leave"."type" = 'emergency' THEN 1 ELSE 0 END`),
          ),
          "emergency",
        ],
        [
          fn(
            "SUM",
            literal(`CASE WHEN "Leave"."type" = 'unpaid'    THEN 1 ELSE 0 END`),
          ),
          "unpaid",
        ],
      ],
      include: includeClause,
      group: [monthExpr],
      order: [[monthExpr, "ASC"]],
      subQuery: false,
    });

    return res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error("[LeaveTrends]", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch leave trends" });
  }
};

// ─────────────────────────────────────────────
// 4. Leave Balance  (allocated vs used vs remaining)
//    GET /api/reports/leaves/balance
//    Query: department_id, userId, page, limit
// ─────────────────────────────────────────────

export const getLeaveBalance = async (req, res) => {
  try {
    const { department_id, userId, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const offset = (pageNum - 1) * limitNum;

    const userWhere = {};

    if (req.user?.role === "employee") {
      userWhere.id = req.user.id;
    } else if (req.user?.role === "manager") {
      userWhere.manager_id = req.user.id;
    } else {
      if (userId) userWhere.id = Number(userId);
      if (department_id) userWhere.department_id = Number(department_id);
    }

    const { count: totalUsers, rows: users } = await User.findAndCountAll({
      where: userWhere,
      attributes: { exclude: EXCLUDED_FIELDS },
      include: [
        {
          model: Department,
          as: "dept",
          attributes: ["id", "name", "code"],
          required: false,
        },
      ],
      order: [["name", "ASC"]],
      limit: limitNum,
      offset,
      distinct: true,
    });

    if (users.length === 0) {
      return res.json({
        success: true,
        pagination: {
          total: totalUsers,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalUsers / limitNum),
          hasNext: false,
          hasPrev: pageNum > 1,
        },
        data: [],
      });
    }

    const userIds = users.map((u) => u.id);

    const balances = await LeaveBalance.findAll({
      where: { userId: { [Op.in]: userIds } },
      raw: true,
    });

    const balanceMap = {};
    for (const b of balances) {
      balanceMap[b.user_id ?? b.userId] = b;
    }

    const usedLeaves = await Leave.findAll({
      where: { userId: { [Op.in]: userIds }, overallStatus: "approved" },
      attributes: [
        "userId",
        "type",
        [fn("SUM", col("Leave.days")), "used_days"],
      ],
      group: ["Leave.user_id", "Leave.type"],
      raw: true,
    });

    const usedMap = {};
    for (const ul of usedLeaves) {
      const uid = ul.userId ?? ul.user_id;
      if (!usedMap[uid]) usedMap[uid] = {};
      usedMap[uid][ul.type] = Number(ul.used_days) || 0;
    }

    const data = users.map((user) => {
      const b = balanceMap[user.id] || {};
      const used = usedMap[user.id] || {};

      const annual = Number(b.annual_days ?? b.annual ?? 20);
      const sick = Number(b.sick_days ?? b.sick ?? 10);
      const casual = Number(b.casual_days ?? b.casual ?? 5);

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          employee_id: user.employee_id,
          position: user.position,
          department: user.dept ?? null,
        },
        balance: {
          annual: {
            allocated: annual,
            used: used.annual || 0,
            remaining: annual - (used.annual || 0),
          },
          sick: {
            allocated: sick,
            used: used.sick || 0,
            remaining: sick - (used.sick || 0),
          },
          casual: {
            allocated: casual,
            used: used.casual || 0,
            remaining: casual - (used.casual || 0),
          },
          emergency: { used: used.emergency || 0 },
          unpaid: { used: used.unpaid || 0 },
        },
        totalUsedDays: Object.values(used).reduce((s, v) => s + v, 0),
      };
    });

    const totalPages = Math.ceil(totalUsers / limitNum);

    return res.json({
      success: true,
      pagination: {
        total: totalUsers,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
      data,
    });
  } catch (error) {
    console.error("[LeaveBalance]", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch leave balance" });
  }
};
