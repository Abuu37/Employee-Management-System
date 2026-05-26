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

  if (status && status !== "all") where.status = status;
  if (employment_type && employment_type !== "all") where.employment_type = employment_type;
  if (gender && gender !== "all") where.gender = gender;
  if (role && role !== "all") where.role = role;
  if (department_id) where.department_id = Number(department_id);

  if (search) {
    where[Op.or] = [
      { name:        { [Op.iLike]: `%${search}%` } },
      { email:       { [Op.iLike]: `%${search}%` } },
      { employee_id: { [Op.iLike]: `%${search}%` } },
    ];
  }

  return where;
};
