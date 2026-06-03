// controller/report/payrollReportController.js

import { fn, col, literal, Op } from "sequelize";

import Payroll from "../../models/payroll.js";
import User from "../../models/user.js";
import Department from "../../models/Department.js";

import { buildPayrollFilters } from "./helpers/buildPayrollFilters.js";

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

const buildPayrollUserInclude = (
  department_id,
  withDisplayAttributes = true,
) => ({
  model: User,
  as: "user",
  attributes: withDisplayAttributes
    ? ["id", "name", "email", "employee_id", "position"]
    : [],
  required: Boolean(department_id),
  ...(department_id ? { where: { department_id: Number(department_id) } } : {}),
  include: [
    {
      model: Department,
      as: "dept",
      attributes: withDisplayAttributes ? ["id", "name", "code"] : [],
      required: false,
    },
  ],
});

// ─────────────────────────────────────────────
// Role-based scoping helpers
// ─────────────────────────────────────────────

const applyRoleScope = (req, where) => {
  if (req.user?.role === "employee") {
    return { ...where, user_id: req.user.id };
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
// 1. Payroll Summary  (per-employee aggregation)
//    GET /api/reports/payroll/summary
//    Query: year, month, status, userId, department_id
// ─────────────────────────────────────────────

export const getPayrollSummary = async (req, res) => {
  try {
    const { department_id } = req.query;

    const where = applyRoleScope(req, buildPayrollFilters(req.query));

    const userInclude = applyManagerScope(
      req,
      buildPayrollUserInclude(department_id),
    );

    const rows = await Payroll.findAll({
      where,
      attributes: [
        "user_id",
        [fn("COUNT", col("Payroll.id")), "payroll_count"],
        [fn("SUM", col("Payroll.base_salary")), "total_base_salary"],
        [fn("SUM", col("Payroll.bonus")), "total_bonus"],
        [fn("SUM", col("Payroll.allowance")), "total_allowance"],
        [fn("SUM", col("Payroll.deductions")), "total_deductions"],
        [fn("SUM", col("Payroll.tax")), "total_tax"],
        [fn("SUM", col("Payroll.net_salary")), "total_net_salary"],
        [fn("AVG", col("Payroll.net_salary")), "avg_net_salary"],
        [
          fn(
            "SUM",
            literal(
              `CASE WHEN "Payroll"."status" = 'paid'     THEN "Payroll"."net_salary" ELSE 0 END`,
            ),
          ),
          "total_paid",
        ],
        [
          fn(
            "SUM",
            literal(
              `CASE WHEN "Payroll"."status" = 'pending'  THEN "Payroll"."net_salary" ELSE 0 END`,
            ),
          ),
          "total_pending",
        ],
        [
          fn(
            "SUM",
            literal(
              `CASE WHEN "Payroll"."status" = 'approved' THEN "Payroll"."net_salary" ELSE 0 END`,
            ),
          ),
          "total_approved",
        ],
      ],
      include: [userInclude],
      group: ["Payroll.user_id", "user.id", "user->dept.id"],
      order: [[col("user.name"), "ASC"]],
      subQuery: false,
    });

    return res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error("[PayrollSummary]", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to generate payroll summary" });
  }
};

// ─────────────────────────────────────────────
// 2. Payroll Details  (paginated individual records)
//    GET /api/reports/payroll/details
//    Query: year, month, status, userId, department_id, page, limit
// ─────────────────────────────────────────────

export const getPayrollDetails = async (req, res) => {
  try {
    const { department_id, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const offset = (pageNum - 1) * limitNum;

    const where = applyRoleScope(req, buildPayrollFilters(req.query));

    const userInclude = applyManagerScope(
      req,
      buildPayrollUserInclude(department_id),
    );

    const { count, rows } = await Payroll.findAndCountAll({
      where,
      include: [userInclude],
      order: [
        ["year", "DESC"],
        ["month", "DESC"],
      ],
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
    console.error("[PayrollDetails]", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch payroll details" });
  }
};

// ─────────────────────────────────────────────
// 3. Payroll Trends  (monthly expense chart data)
//    GET /api/reports/payroll/trends
//    Query: year, status, department_id
// ─────────────────────────────────────────────

export const getPayrollTrends = async (req, res) => {
  try {
    const { department_id } = req.query;

    const where = applyRoleScope(req, buildPayrollFilters(req.query));

    const needsJoin = req.user?.role === "manager" || Boolean(department_id);
    const includeClause = needsJoin
      ? [applyManagerScope(req, buildPayrollUserInclude(department_id, false))]
      : [];

    const rows = await Payroll.findAll({
      where,
      attributes: [
        "year",
        "month",
        [fn("COUNT", col("Payroll.id")), "payroll_count"],
        [
          fn("COUNT", literal(`DISTINCT "Payroll"."user_id"`)),
          "employee_count",
        ],
        [fn("SUM", col("Payroll.base_salary")), "total_base_salary"],
        [fn("SUM", col("Payroll.bonus")), "total_bonus"],
        [fn("SUM", col("Payroll.allowance")), "total_allowance"],
        [fn("SUM", col("Payroll.deductions")), "total_deductions"],
        [fn("SUM", col("Payroll.tax")), "total_tax"],
        [fn("SUM", col("Payroll.net_salary")), "total_net_salary"],
        [fn("AVG", col("Payroll.net_salary")), "avg_net_salary"],
      ],
      include: includeClause,
      group: ["Payroll.year", "Payroll.month"],
      order: [
        ["year", "ASC"],
        ["month", "ASC"],
      ],
      subQuery: false,
    });

    return res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error("[PayrollTrends]", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch payroll trends" });
  }
};

// ─────────────────────────────────────────────
// 4. Salary Analytics  (dashboard-ready stats)
//    GET /api/reports/payroll/analytics
//    Query: year, month, status
//    Access: admin only
// ─────────────────────────────────────────────

export const getSalaryAnalytics = async (req, res) => {
  try {
    const where = buildPayrollFilters(req.query);

    const [overallStats, topEarners, byDepartment, byStatus] =
      await Promise.all([
        // Overall totals & averages
        Payroll.findOne({
          where,
          attributes: [
            [fn("COUNT", col("id")), "total_records"],
            [fn("COUNT", literal(`DISTINCT "user_id"`)), "total_employees"],
            [fn("SUM", col("base_salary")), "total_base_salary"],
            [fn("SUM", col("bonus")), "total_bonus"],
            [fn("SUM", col("allowance")), "total_allowance"],
            [fn("SUM", col("deductions")), "total_deductions"],
            [fn("SUM", col("tax")), "total_tax"],
            [fn("SUM", col("net_salary")), "total_net_salary"],
            [fn("AVG", col("net_salary")), "avg_net_salary"],
            [fn("MAX", col("net_salary")), "max_net_salary"],
            [fn("MIN", col("net_salary")), "min_net_salary"],
          ],
          raw: true,
        }),

        // Top 10 earners
        Payroll.findAll({
          where,
          attributes: [
            "user_id",
            [fn("SUM", col("Payroll.net_salary")), "total_net_salary"],
            [fn("AVG", col("Payroll.net_salary")), "avg_net_salary"],
            [fn("SUM", col("Payroll.bonus")), "total_bonus"],
            [fn("COUNT", col("Payroll.id")), "payroll_count"],
          ],
          include: [buildPayrollUserInclude(null)],
          group: ["Payroll.user_id", "user.id", "user->dept.id"],
          order: [[fn("SUM", col("Payroll.net_salary")), "DESC"]],
          limit: 10,
          subQuery: false,
        }),

        // Department payroll totals — start from Department so all depts appear
        Department.findAll({
          attributes: [
            "id",
            "name",
            "code",
            [
              fn(
                "COALESCE",
                fn("SUM", col("employees->payrolls.net_salary")),
                literal("0"),
              ),
              "total_net_salary",
            ],
            [
              fn(
                "COALESCE",
                fn("SUM", col("employees->payrolls.base_salary")),
                literal("0"),
              ),
              "total_base_salary",
            ],
            [
              fn(
                "COALESCE",
                fn("SUM", col("employees->payrolls.bonus")),
                literal("0"),
              ),
              "total_bonus",
            ],
            [
              fn(
                "COALESCE",
                fn("SUM", col("employees->payrolls.deductions")),
                literal("0"),
              ),
              "total_deductions",
            ],
            [
              fn(
                "COALESCE",
                fn("AVG", col("employees->payrolls.net_salary")),
                literal("0"),
              ),
              "avg_net_salary",
            ],
            [fn("COUNT", col("employees->payrolls.id")), "payroll_count"],
            [
              fn("COUNT", literal(`DISTINCT "employees"."id"`)),
              "employee_count",
            ],
          ],
          include: [
            {
              model: User,
              as: "employees",
              attributes: [],
              required: false,
              include: [
                {
                  model: Payroll,
                  as: "payrolls",
                  attributes: [],
                  required: false,
                  where: Object.keys(where).length ? where : undefined,
                },
              ],
            },
          ],
          group: ["Department.id"],
          order: [
            [
              fn(
                "COALESCE",
                fn("SUM", col("employees->payrolls.net_salary")),
                literal("0"),
              ),
              "DESC",
            ],
          ],
          subQuery: false,
        }),

        // Breakdown by payroll status
        Payroll.findAll({
          where,
          attributes: [
            "status",
            [fn("COUNT", col("id")), "count"],
            [fn("SUM", col("net_salary")), "total_net_salary"],
          ],
          group: ["status"],
          raw: true,
        }),
      ]);

    return res.json({
      success: true,
      data: { overallStats, topEarners, byDepartment, byStatus },
    });
  } catch (error) {
    console.error("[SalaryAnalytics]", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch salary analytics" });
  }
};
