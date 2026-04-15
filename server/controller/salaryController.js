import Salary from "../models/salary.js";

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