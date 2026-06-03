import { Op } from "sequelize";
import { buildDateRangeFilter } from "./dateRange.js";

/**
 * Builds a Sequelize WHERE clause for User (employee) queries.
 *
 * Supported query params:
 *   status          – "active" | "inactive" | "all"
 *   employment_type – "full-time" | "part-time" | "contract" | "intern" | "all"
 *   gender          – "male" | "female" | "other" | "all"
 *   role            – "admin" | "manager" | "employee" | "all"
 *   department_id   – numeric department id
 *   joinDateFrom    – join date start "YYYY-MM-DD"
 *   joinDateTo      – join date end   "YYYY-MM-DD"
 *   search          – partial match on name, email, or employee_id
 *
 * @param {Object} query - req.query
 * @returns {Object} Sequelize WHERE clause
 */
export const buildEmployeeFilters = (query) => {
  const {
    status,
    employment_type,
    gender,
    role,
    department_id,
    joinDateFrom,
    joinDateTo,
    search,
  } = query;

  const where = {
    ...buildDateRangeFilter("join_date", joinDateFrom, joinDateTo),
  };

  const normalizedStatus = status ? String(status).trim().toLowerCase() : "";
  const normalizedEmploymentType = employment_type
    ? String(employment_type)
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "_")
    : employment_type;
  const normalizedSearch = search ? String(search).trim() : "";
  const parsedDepartmentId = Number(department_id);

  if (normalizedStatus && normalizedStatus !== "all") {
    if (normalizedStatus === "active" || normalizedStatus === "inactive") {
      where.status = normalizedStatus;
    }
  }
  if (normalizedEmploymentType && normalizedEmploymentType !== "all") {
    const variants = Array.from(
      new Set([
        normalizedEmploymentType,
        normalizedEmploymentType.replace(/_/g, "-"),
        normalizedEmploymentType.replace(/_/g, " "),
      ]),
    );
    where.employment_type = { [Op.in]: variants };
  }
  if (gender && gender !== "all") where.gender = gender;
  if (role && role !== "all") where.role = role;
  if (
    department_id &&
    Number.isFinite(parsedDepartmentId) &&
    parsedDepartmentId > 0
  ) {
    where.department_id = parsedDepartmentId;
  }

  if (normalizedSearch) {
    const searchTerms = normalizedSearch.split(/\s+/).filter(Boolean);
    const searchConditions = searchTerms.flatMap((term) => [
      { name: { [Op.iLike]: `%${term}%` } },
      { email: { [Op.iLike]: `%${term}%` } },
      { employee_id: { [Op.iLike]: `%${term}%` } },
    ]);

    if (searchConditions.length) {
      where[Op.or] = searchConditions;
    }
  }

  return where;
};
