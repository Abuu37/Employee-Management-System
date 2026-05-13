import Document from "../../models/document.js";
import User from "../../models/user.js";
import { Op } from "sequelize";

// ================= GET DOCUMENT STATS (ROLE-AWARE) =================
export const getDocumentStats = async (req, res) => {
  try {
    const { id: userId, role } = req.user;

    let where = {};

    if (role === "manager") {
      // Team members + the manager themselves
      const teamMembers = await User.findAll({
        where: { manager_id: userId },
        attributes: ["id"],
      });
      const teamIds = teamMembers.map((u) => u.id);
      teamIds.push(userId);

      where = {
        [Op.or]: [
          { user_id: { [Op.in]: teamIds } },
          { visibility: "team", uploaded_by: userId },
        ],
      };
    } else if (role === "employee") {
      // Own docs + team-visibility docs from their team
      const user = await User.findByPk(userId);
      let teamMemberIds = [userId];

      if (user?.manager_id) {
        const teamMembers = await User.findAll({
          where: { manager_id: user.manager_id },
          attributes: ["id"],
        });
        teamMemberIds = teamMembers.map((u) => u.id);
        teamMemberIds.push(user.manager_id);
      } else {
        const teamMembers = await User.findAll({
          where: { manager_id: userId },
          attributes: ["id"],
        });
        teamMemberIds = teamMembers.map((u) => u.id);
        teamMemberIds.push(userId);
      }

      where = {
        [Op.or]: [
          { user_id: userId },
          { visibility: "team", uploaded_by: { [Op.in]: teamMemberIds } },
        ],
      };
    }
    // admin: where stays {} → counts all documents

    const [total, verified, pending] = await Promise.all([
      Document.count({ where }),
      Document.count({ where: { ...where, is_verified: true } }),
      Document.count({ where: { ...where, is_verified: false } }),
    ]);

    res.json({ total, verified, pending });
  } catch (error) {
    console.error("getDocumentStats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
