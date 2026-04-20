import Salary from "../models/salary.js";
import User from "../models/user.js";

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
    const salaries = await Salary.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "role"],
        },
      ],
      order: [["created_at", "DESC"]],
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
