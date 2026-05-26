import { Op } from "sequelize";
import { buildDateRangeFilter } from "./dateRange.js";

/**
 * Simplified status groups for the leave overall_status enum.
 *   pending  → pending_manager | pending_hr
 *   approved → approved
 *   rejected → rejected_by_manager | rejected_by_hr
 */
const STATUS_MAP = {
  pending: { [Op.in]: ["pending_manager", "pending_hr"] },
  approved: "approved",
  rejected: { [Op.in]: ["rejected_by_manager", "rejected_by_hr"] },
};

/**
 * Builds a Sequelize WHERE clause for Leave queries.
 *
 * Supported query params:
 *   dateFrom  – start_date range start "YYYY-MM-DD"
 *   dateTo    – start_date range end   "YYYY-MM-DD"
 *   type      – "annual" | "sick" | "casual" | "emergency" | "unpaid" | "all"
 *   status    – "pending" | "approved" | "rejected" | "all"
 *   userId    – numeric employee id
 *
 * @param {Object} query - req.query
 * @returns {Object} Sequelize WHERE clause
 */
export const buildLeaveFilters = (query) => {
  const { dateFrom, dateTo, type, status, userId } = query;

  const where = {
    // Leave model uses JS attribute "startDate" → DB column "start_date"
    ...buildDateRangeFilter("startDate", dateFrom, dateTo),
  };

  if (type && type !== "all") {
    where.type = type;
  }

  if (status && status !== "all") {
    where.overallStatus = STATUS_MAP[status] ?? status;
  }

  if (userId) {
    where.userId = Number(userId);
  }

  return where;
};
