import { buildDateRangeFilter } from "./dateRange.js";

/**
 * Builds Sequelize WHERE clause for Attendance queries.
 *
 * Supported query params:
 *   dateFrom   – start date "YYYY-MM-DD"
 *   dateTo     – end date   "YYYY-MM-DD"
 *   status     – "present" | "absent" | "late" | "half_day" | "all"
 *   userId     – numeric employee id
 *
 * @param {Object} query - req.query
 * @returns {Object} Sequelize WHERE clause
 */
export const buildAttendanceFilters = (query) => {
  const { dateFrom, dateTo, status, userId } = query;

  const where = {
    ...buildDateRangeFilter("date", dateFrom, dateTo),
  };

  // attendance status filter
  if (status && status !== "all") {
    where.status = status;
  }

  // employee filter
  if (userId) {
    where.user_id = Number(userId);
  }

  return where;
};
