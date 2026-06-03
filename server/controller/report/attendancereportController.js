// controller/report/attendancereportController.js

import { Op, fn, col, literal } from "sequelize";

import Attendance from "../../models/Attendance.js";
import User from "../../models/user.js";
import Department from "../../models/Department.js";

import { buildAttendanceFilters } from "./helpers/buildAttendanceFilters.js";

// ─────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────

/**
 * Builds a Sequelize include for User → Department.
 * If `departmentFilter` is provided the Department where clause is added
 * so Sequelize performs an inner join (INNER JOIN instead of LEFT JOIN).
 */
const buildUserInclude = ( departmentFilter, search, withDisplayAttributes = true,) => {
  const userWhere = {};
  if (search) {
    userWhere[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
      { employee_id: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const deptWhere = {};
  if (departmentFilter) {
    const maybeId = Number(departmentFilter);
    if (!Number.isNaN(maybeId) && Number.isInteger(maybeId)) {
      deptWhere.id = maybeId;
    } else {
      deptWhere.name = { [Op.iLike]: `%${departmentFilter}%` };
    }
  }

  return {
    model: User,
    as: "user",
    attributes: withDisplayAttributes
      ? ["id", "name", "email", "employee_id", "position"]
      : [],
    ...(Object.keys(userWhere).length ? { where: userWhere } : {}),
    required: Boolean(departmentFilter || search),
    include: [
      {
        model: Department,
        as: "dept",
        attributes: withDisplayAttributes ? ["id", "name"] : [],
        required: Boolean(departmentFilter),
        ...(Object.keys(deptWhere).length ? { where: deptWhere } : {}),
      },
    ],
  };
};

/**
 * When the caller is a manager, restrict results to employees whose
 * manager_id matches the requesting user's id.
 */
const scopeToManager = (req, userInclude) => {
  if (req.user?.role !== "manager") return userInclude;

  return {
    ...userInclude,
    where: { ...(userInclude.where || {}), manager_id: req.user.id },
    required: true,
  };
};

/**
 * Applies role-based scoping to the Attendance WHERE clause.
 * - employee : always locked to their own records (ignores any userId param)
 * - manager  : scopeToManager handles the User include separately
 * - admin    : no restriction on where clause
 */
const applyRoleScope = (req, where) => {
  if (req.user?.role === "employee") {
    return { ...where, user_id: req.user.id };
  }
  return where;
};

const ORDERABLE_COLUMNS = new Set([
  "date",
  "status",
  "check_in",
  "check_out",
  "total_hours",
  "createdAt",
  "updatedAt",
]);

const resolveSort = (sortBy, sortOrder) => {
  const safeSortBy = ORDERABLE_COLUMNS.has(String(sortBy))
    ? String(sortBy)
    : "date";
  const safeSortOrder =
    String(sortOrder).toUpperCase() === "ASC" ? "ASC" : "DESC";
  return { safeSortBy, safeSortOrder };
};

const csvEscape = (value) => {
  if (value == null) return "";
  const s = String(value);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

const fetchAttendanceDetailRows = async (req, options = {}) => {
  const { department, search, sortBy = "date", sortOrder = "DESC" } = req.query;

  const where = applyRoleScope(req, buildAttendanceFilters(req.query));
  const userInclude = scopeToManager(req, buildUserInclude(department, search));
  const { safeSortBy, safeSortOrder } = resolveSort(sortBy, sortOrder);

  const query = {
    where,
    include: [userInclude],
    order: [[safeSortBy, safeSortOrder]],
    subQuery: false,
  };

  if (!options.exportAll) {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 20;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const offset = (pageNum - 1) * limitNum;
    query.limit = limitNum;
    query.offset = offset;
    return { query, pageNum, limitNum };
  }

  return { query };
};

// ─────────────────────────────────────────────
// 1. Attendance Summary
//    GET /api/reports/attendance/summary
//    Query: dateFrom, dateTo, status, userId, department
// ─────────────────────────────────────────────

export const getAttendanceSummary = async (req, res) => {
  try {
    const { department, search } = req.query;

    const where = applyRoleScope(req, buildAttendanceFilters(req.query));

    const userInclude = scopeToManager(
      req,
      buildUserInclude(department, search),
    );

    const rows = await Attendance.findAll({
      where,
      attributes: [
        "user_id",
        [fn("COUNT", col("Attendance.id")), "total_days"],
        [
          fn(
            "SUM",
            literal(
              `CASE WHEN "Attendance"."status" = 'present' THEN 1 ELSE 0 END`,
            ),
          ),
          "present",
        ],
        [
          fn(
            "SUM",
            literal(
              `CASE WHEN "Attendance"."status" = 'late' THEN 1 ELSE 0 END`,
            ),
          ),
          "late",
        ],
        [
          fn(
            "SUM",
            literal(
              `CASE WHEN "Attendance"."status" = 'absent' THEN 1 ELSE 0 END`,
            ),
          ),
          "absent",
        ],
        [
          fn(
            "SUM",
            literal(
              `CASE WHEN "Attendance"."status" = 'half_day' THEN 1 ELSE 0 END`,
            ),
          ),
          "half_day",
        ],
        [
          literal(`COALESCE(SUM("Attendance"."total_hours"), 0)`),
          "total_hours",
        ],
      ],
      include: [userInclude],
      group: ["Attendance.user_id", "user.id", "user->dept.id"],
      order: [[col("user.name"), "ASC"]],
      subQuery: false,
    });

    // Compute overall stats for the summary cards
    const stats = rows.reduce(
      (acc, row) => {
        const r = row.toJSON();
        acc.totalPresent += Number(r.present) || 0;
        acc.totalAbsent += Number(r.absent) || 0;
        acc.totalLate += Number(r.late) || 0;
        acc.totalHalfDay += Number(r.half_day) || 0;
        acc.totalHours += Number(r.total_hours) || 0;
        return acc;
      },
      {
        totalPresent: 0,
        totalAbsent: 0,
        totalLate: 0,
        totalHalfDay: 0,
        totalHours: 0,
      },
    );

    return res.json({
      success: true,
      count: rows.length,
      data: rows,
      stats,
    });

    


  } catch (error) {
    console.error("[AttendanceSummary]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate attendance summary",
    });
  }
};

// ─────────────────────────────────────────────
// 2. Attendance Details (paginated)
//    GET /api/reports/attendance/detail
//    Query: dateFrom, dateTo, status, userId, department, page, limit
// ─────────────────────────────────────────────

export const getAttendanceDetails = async (req, res) => {
  try {
    const { query, pageNum, limitNum } = await fetchAttendanceDetailRows(req);

    const { count, rows } = await Attendance.findAndCountAll(query);

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
    console.error("[AttendanceDetails]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch attendance details",
    });
  }
};

// ─────────────────────────────────────────────
// 4. Attendance Export CSV
//    GET /api/reports/attendance/export/csv
//    Query: same as details (without pagination)
// ─────────────────────────────────────────────

export const exportAttendanceCsv = async (req, res) => {
  try {
    const { query } = await fetchAttendanceDetailRows(req, { exportAll: true });
    const rows = await Attendance.findAll(query);

    const headers = [
      "Employee Name",
      "Employee Email",
      "Employee ID",
      "Department",
      "Date",
      "Status",
      "Check In",
      "Check Out",
      "Working Hours",
    ];

    const body = rows.map((rec) => {
      const r = rec.toJSON();
      return [
        r.user?.name ?? "",
        r.user?.email ?? "",
        r.user?.employee_id ?? "",
        r.user?.dept?.name ?? r.user?.department ?? "",
        r.date ?? "",
        r.status ?? "",
        r.check_in ?? "",
        r.check_out ?? "",
        r.total_hours ?? "",
      ]
        .map(csvEscape)
        .join(",");
    });

    const csv = [headers.join(","), ...body].join("\n");
    const stamp = new Date().toISOString().slice(0, 10);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=attendance-report-${stamp}.csv`,
    );
    return res.status(200).send(`\uFEFF${csv}`);
  } catch (error) {
    console.error("[AttendanceExportCsv]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to export attendance CSV",
    });
  }
};

// ─────────────────────────────────────────────
// 3. Daily Attendance Trends
//    GET /api/reports/attendance/trends
//    Query: dateFrom, dateTo, status, userId, department
//    Returns: one row per date — suitable for charts
// ─────────────────────────────────────────────

export const getDailyAttendanceTrends = async (req, res) => {
  try {
    const { department, search } = req.query;

    const where = applyRoleScope(req, buildAttendanceFilters(req.query));

    const needsJoin =
      req.user?.role === "manager" || Boolean(department) || Boolean(search);
    const includeClause = needsJoin
      ? [scopeToManager(req, buildUserInclude(department, search, false))]
      : [];

    const rows = await Attendance.findAll({
      where,
      attributes: [
        "date",
        [fn("COUNT", col("Attendance.id")), "total"],
        [
          fn(
            "SUM",
            literal(
              `CASE WHEN "Attendance"."status" = 'present' THEN 1 ELSE 0 END`,
            ),
          ),
          "present",
        ],
        [
          fn(
            "SUM",
            literal(
              `CASE WHEN "Attendance"."status" = 'late' THEN 1 ELSE 0 END`,
            ),
          ),
          "late",
        ],
        [
          fn(
            "SUM",
            literal(
              `CASE WHEN "Attendance"."status" = 'absent' THEN 1 ELSE 0 END`,
            ),
          ),
          "absent",
        ],
        [
          fn(
            "SUM",
            literal(
              `CASE WHEN "Attendance"."status" = 'half_day' THEN 1 ELSE 0 END`,
            ),
          ),
          "half_day",
        ],
        [
          literal(`COALESCE(SUM("Attendance"."total_hours"), 0)`),
          "total_hours",
        ],
      ],
      include: includeClause,
      group: ["Attendance.date"],
      order: [["date", "ASC"]],
      subQuery: false,
    });

    return res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("[AttendanceTrends]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch attendance trends",
    });
  }
};
