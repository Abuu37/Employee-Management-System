import Salary from "../models/salary.js";
import User from "../models/user.js";
import { Op, fn, col, literal } from "sequelize";

// ================= SET / UPDATE SALARY =================
export const setSalary = async (req, res) => {
  try {
    const { user_id, base_salary, bonus, allowance, tax_percentage } = req.body;

    if (!user_id || !base_salary) {
      return res.status(400).json({
        message: "user_id and base_salary are required",
      });
    }

    let salary = await Salary.findOne({ where: { user_id } });

    if (salary) {
      // Update
      salary.base_salary = base_salary;
      salary.bonus = bonus || 0;
      salary.allowance = allowance || 0;
      salary.tax_percentage = tax_percentage || 0;

      await salary.save();
    } else {
      // Create
      salary = await Salary.create({
        user_id,
        base_salary,
        bonus: bonus || 0,
        allowance: allowance || 0,
        tax_percentage: tax_percentage || 0,
      });
    }

    res.status(200).json({
      message: "Salary saved successfully",
      salary,
    });
  } catch (error) {
    console.error("Error setting salary:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// ================= GET ALL SALARIES =================
export const getAllSalaries = async (req, res) => {
  try {
    const { sortBy = "created_at", sortOrder = "DESC" } = req.query;

    const validSortFields = [
      "base_salary",
      "bonus",
      "allowance",
      "tax_percentage",
      "created_at",
    ];
    const orderField = validSortFields.includes(sortBy) ? sortBy : "created_at";
    const orderDir = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const salaries = await Salary.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "role"],
        },
      ],
      order: [[orderField, orderDir]],
    });
    res.status(200).json({ salaries });
  } catch (error) {
    console.error("Error fetching salaries:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= GET SALARY BY USER ID =================
export const getSalaryByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const salary = await Salary.findOne({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "role"],
        },
      ],
    });

    if (!salary) {
      return res.status(404).json({ message: "Salary record not found" });
    }

    res.status(200).json({ salary });
  } catch (error) {
    console.error("Error fetching salary:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= GET MY SALARY =================
export const getMySalary = async (req, res) => {
  try {
    const userId = req.user.id;

    const salary = await Salary.findOne({
      where: { user_id: userId },
    });

    if (!salary) {
      return res.status(404).json({ message: "Salary record not found" });
    }

    res.status(200).json({ salary });
  } catch (error) {
    console.error("Error fetching my salary:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= DELETE SALARY =================
export const deleteSalary = async (req, res) => {
  try {
    const { id } = req.params;

    const salary = await Salary.findByPk(id);

    if (!salary) {
      return res.status(404).json({ message: "Salary record not found" });
    }

    await salary.destroy();

    res.status(200).json({ message: "Salary deleted successfully" });
  } catch (error) {
    console.error("Error deleting salary:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= GET SALARY STATS =================
export const getSalaryStats = async (req, res) => {
  try {
    const rows = await Salary.findAll({
      attributes: ["base_salary", "bonus", "allowance", "tax_percentage"],
    });

    //======== Calculate total count, total gross, total net, and average base salary ========//

    const total = rows.length;  //total rows
    let totalGross = 0;
    let totalNet = 0;

    for (const r of rows) {
      const base = Number(r.base_salary);
      const bonus = Number(r.bonus || 0);
      const allowance = Number(r.allowance || 0);
      const taxPct = Number(r.tax_percentage || 0);
      const gross = base + bonus + allowance;
      const net = gross - (gross * taxPct) / 100;
      totalGross += gross;
      totalNet += net;
    }

    //======== Calculate average base salary ========//
    const avgBase =  total > 0
        ? rows.reduce((sum, r) => sum + Number(r.base_salary), 0) / total
        : 0;

    res.status(200).json({
      total,
      avgBase: Math.round(avgBase * 100) / 100,
      totalGross: Math.round(totalGross * 100) / 100,
      totalNet: Math.round(totalNet * 100) / 100,
    });
  } catch (error) {
    console.error("Error fetching salary stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
