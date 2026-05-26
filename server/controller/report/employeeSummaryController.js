// controller/report/employeeSummaryController.js

import { fn, col, literal, Op } from "sequelize";

import User from "../../models/user.js";
import Department from "../../models/Department.js";
import { buildEmployeeFilters } from "./helpers/buildEmployeeFilters.js";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

/** Sensitive fields never returned in responses */
const EXCLUDED_FIELDS = [
  "password",
  "resetPasswordToken",
  "resetPasswordExpires",
  "refreshTokenHash",
];

/** Sortable columns whitelist (guards against SQL injection) */
const ALLOWED_SORT_COLUMNS = [
  "name",
  "join_date",
  "status",
  "role",
  "employment_type",
  "office_branch",
];

// ─────────────────────────────────────────────
// Shared includes
// ─────────────────────────────────────────────

const deptInclude = {
  model: Department,
  as: "dept",
  attributes: ["id", "name", "code"],
};

const supervisorInclude = {
  model: User,
  as: "supervisor",
  attributes: ["id", "name", "email", "position"],
};

// ─────────────────────────────────────────────
// Role-based scoping
// ─────────────────────────────────────────────

/**
 * Managers only see their direct reports (users whose manager_id = req.user.id).
 * Admins see everyone.
 */
const applyManagerScope = (req, where) => {
  if (req.user?.role === "manager") {
    return { ...where, manager_id: req.user.id };
  }
  return where;
};

// ─────────────────────────────────────────────
// 1. Employee Summary  (dashboard-ready)
//    GET /api/reports/employees/summary
//    Query: status, employment_type, gender, role, department_id,
//           joinDateFrom, joinDateTo, search
// ─────────────────────────────────────────────

export const getEmployeeSummary = async (req, res) => {
  try {
    const where = applyManagerScope(req, buildEmployeeFilters(req.query));

    const [
      total,
      byStatus,
      byGender,
      byEmploymentType,
      byRole,
      byOfficeBranch,
      byDepartment,
      recentJoined,
    ] = await Promise.all([

      // 1 — Total headcount
      User.count({ where }),

      // 2 — Breakdown by status
      User.findAll({
        where,
        attributes: ["status", [fn("COUNT", col("id")), "count"]],
        group: ["status"],
        raw: true,
      }),

      // 3 — Breakdown by gender
      User.findAll({
        where,
        attributes: ["gender", [fn("COUNT", col("id")), "count"]],
        group: ["gender"],
        raw: true,
      }),

      // 4 — Breakdown by employment type
      User.findAll({
        where,
        attributes: ["employment_type", [fn("COUNT", col("id")), "count"]],
        group: ["employment_type"],
        raw: true,
      }),

      // 5 — Breakdown by role
      User.findAll({
        where,
        attributes: ["role", [fn("COUNT", col("id")), "count"]],
        group: ["role"],
        raw: true,
      }),

      // 6 — Breakdown by office branch
      User.findAll({
        where,
        attributes: ["office_branch", [fn("COUNT", col("id")), "count"]],
        group: ["office_branch"],
        raw: true,
      }),

      // 7 — Breakdown by department (top 10)
      User.findAll({
        where,
        attributes: [
          "department_id",
          [fn("COUNT", col("User.id")), "count"],
        ],
        include: [{ ...deptInclude, required: false }],
        group: ["User.department_id", "dept.id"],
        order: [[fn("COUNT", col("User.id")), "DESC"]],
        limit: 10,
        subQuery: false,
      }),

      // 8 — 10 most recently joined employees
      User.findAll({
        where: { ...where, join_date: { [Op.ne]: null } },
        attributes: { exclude: EXCLUDED_FIELDS },
        include: [deptInclude, supervisorInclude],
        order: [["join_date", "DESC"]],
        limit: 10,
      }),
    ]);

    return res.json({
      success: true,
      data: {
        total,
        activeCount:   byStatus.find((r) => r.status === "active")?.count  ?? 0,
        inactiveCount: byStatus.find((r) => r.status === "inactive")?.count ?? 0,
        byStatus,
        byGender,
        byEmploymentType,
        byRole,
        byOfficeBranch,
        byDepartment,
        recentJoined,
      },
    });
  } catch (error) {
    console.error("[EmployeeSummary]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate employee summary",
    });
  }
};

// ─────────────────────────────────────────────
// 2. Employee List  (paginated + filtered)
//    GET /api/reports/employees/
//    Query: ...filters + page, limit, sortBy, sortOrder
// ─────────────────────────────────────────────

export const getEmployeeList = async (req, res) => {
  try {
    const {
      page      = 1,
      limit     = 20,
      sortBy    = "name",
      sortOrder = "ASC",
    } = req.query;

    const pageNum  = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const offset   = (pageNum - 1) * limitNum;

    const safeSort  = ALLOWED_SORT_COLUMNS.includes(sortBy) ? sortBy : "name";
    const safeOrder = sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC";

    const where = applyManagerScope(req, buildEmployeeFilters(req.query));

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: EXCLUDED_FIELDS },
      include: [deptInclude, supervisorInclude],
      order: [[safeSort, safeOrder]],
      limit: limitNum,
      offset,
      distinct: true,
    });

    const totalPages = Math.ceil(count / limitNum);

    return res.json({
      success: true,
      pagination: {
        total:      count,
        page:       pageNum,
        limit:      limitNum,
        totalPages,
        hasNext:    pageNum < totalPages,
        hasPrev:    pageNum > 1,
      },
      data: rows,
    });
  } catch (error) {
    console.error("[EmployeeList]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch employee list",
    });
  }
};

// ─────────────────────────────────────────────
// 3. Department Statistics
//    GET /api/reports/employees/department-stats
//    Returns per-department headcount with active/inactive split + manager info
// ─────────────────────────────────────────────

export const getDepartmentStats = async (req, res) => {
  try {
    const rows = await Department.findAll({
      attributes: [
        "id",
        "name",
        "code",
        "status",
        [fn("COUNT", col("employees.id")), "total_employees"],
        [
          fn("SUM", literal(`CASE WHEN "employees"."status" = 'active' THEN 1 ELSE 0 END`)),
          "active_employees",
        ],
        [
          fn("SUM", literal(`CASE WHEN "employees"."status" = 'inactive' THEN 1 ELSE 0 END`)),
          "inactive_employees",
        ],
      ],
      include: [
        {
          model: User,
          as: "employees",
          attributes: [],         // only needed for aggregation
          required: false,        // LEFT JOIN — show depts with 0 employees
        },
        {
          model: User,
          as: "manager",
          attributes: ["id", "name", "email", "position"],
          required: false,        // LEFT JOIN — show depts without a manager
        },
      ],
      group: ["Department.id", "manager.id"],
      order: [[fn("COUNT", col("employees.id")), "DESC"]],
      subQuery: false,
    });

    return res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("[DepartmentStats]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch department statistics",
    });
  }
};