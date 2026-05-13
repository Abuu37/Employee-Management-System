import Department from "../../models/Department.js";
import User from "../../models/user.js";
import { Op } from "sequelize";

// ================= GET SUMMARY STATS =================
export const getDepartmentStats = async (req, res) => {
  try {
    const [total, active, assigned, totalEmployees] = await Promise.all([
      Department.count(),
      Department.count({ where: { status: "active" } }),
      Department.count({ where: { manager_id: { [Op.ne]: null } } }),
      User.count({
        where: { role: "employee", department_id: { [Op.ne]: null } },
      }),
    ]);

    res.json({ total, active, assigned, totalEmployees });
  } catch (error) {
    console.error("getDepartmentStats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
