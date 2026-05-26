/**
 * Builds a Sequelize WHERE clause for Payroll queries.
 *
 * Supported query params:
 *   year        – payroll year  (e.g. 2026)
 *   month       – payroll month (1–12)
 *   status      – "pending" | "approved" | "paid" | "all"
 *   userId      – numeric employee id  (maps to Payroll.user_id)
 *
 * Note: department_id is NOT a Payroll field.
 *       Pass it separately to the User include via buildPayrollUserInclude().
 *
 * @param {Object} query - req.query
 * @returns {Object} Sequelize WHERE clause
 */
export const buildPayrollFilters = (query) => {
  const { year, month, status, userId } = query;

  const where = {};

  if (year) where.year = Number(year);
  if (month) where.month = Number(month);

  if (status && status !== "all") where.status = status;

  // Employee role scope is applied by the controller (applyRoleScope)
  // Admin/manager can pass userId to drill into a specific person
  if (userId) where.user_id = Number(userId);

  return where;
};
