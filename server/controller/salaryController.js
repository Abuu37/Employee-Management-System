import Salary from "../models/salary.js";

//Create or update salary details
export const setSalary = async (req, res) => {
  try {
    const { user_id, base_salary, bonus, allowance, tax_percentage } = req.body;

    // Check if salary record exists
    let salaryRecord = await Salary.findOne({ where: { user_id } });

    if (salaryRecord) {
      // Update existing salary record
      salaryRecord.base_salary = base_salary;
      salaryRecord.bonus = bonus;
      salaryRecord.allowance = allowance;
      salaryRecord.tax_percentage = tax_percentage;
      await salaryRecord.save();
    } else {
      // Create new salary record
      salaryRecord = await Salary.create({
        user_id,
        base_salary,
        bonus,
        allowance,
        tax_percentage,
      });
    }

    res.json({
      message: "Salary details set successfully",
      salary: salaryRecord,
    });
  } catch (error) {
    console.error("Error setting salary details:", error);
    res
      .status(500)
      .json({ error: "An error occurred while setting salary details" });
  }
};
