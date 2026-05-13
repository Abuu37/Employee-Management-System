import Project from "../../models/project.js";
import { Op } from "sequelize";

// ================= GET PROJECT STATS (ROLE-AWARE) =================
export const getProjectStats = async (req, res) => {
  try {
    const where = req.user.role === "manager" ? { managerId: req.user.id } : {};

    const [total, inProgress, completed, pending] = await Promise.all([
      Project.count({ where }),
      Project.count({
        where: {
          ...where,
          status: "in_progress",
        },
      }),
      Project.count({
        where: {
          ...where,
          status: "complete",
        },
      }),
      Project.count({
        where: {
          ...where,
          status: "pending",
        },
      }),
    ]);

    return res.status(200).json({ total, inProgress, completed, pending });
  } catch (error) {
    console.error("getProjectStats error:", error);
    return res.status(500).json({ message: "Failed to fetch project stats" });
  }
};
