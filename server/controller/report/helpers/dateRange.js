import { Op } from "sequelize";

/**
 * Builds a Sequelize date range filter for a given date field.
 * @param {string} dateField - The model field to filter on (e.g. "date")
 * @param {string|undefined} dateFrom - Start date string "YYYY-MM-DD"
 * @param {string|undefined} dateTo   - End date string "YYYY-MM-DD"
 * @returns {Object} Sequelize where clause fragment
 */
export const buildDateRangeFilter = (dateField, dateFrom, dateTo) => {
  if (!dateFrom && !dateTo) return {};

  if (dateFrom && dateTo) {
    return {
      [dateField]: { [Op.between]: [dateFrom, dateTo] },
    };
  }

  if (dateFrom) {
    return { [dateField]: { [Op.gte]: dateFrom } };
  }

  return { [dateField]: { [Op.lte]: dateTo } };
};
