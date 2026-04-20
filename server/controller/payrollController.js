import Payroll from "../models/payroll.js";
import Salary from "../models/salary.js";
import User from "../models/user.js";
import { sequelize } from "../config/db.js";

// ================= GENERATE PAYROLL =================
export const generatePayroll = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { user_id, month, year } = req.body; // Get salary details for the user

    if (!user_id || !month || !year) {
      await t.rollback();
      return res.status(400).json({
        message: "user_id, month and year are required to generate payroll",
      });
    }

    // get salary
    const salaryRecord = await Salary.findOne({
      where: { user_id },
      transaction: t,
    });

    if (!salaryRecord) {
      await t.rollback();
      return res.status(404).json({
        message: "User salary details not found",
      });
    }

    //prevent duplicate payroll
    const existing = await Payroll.findOne({
      where: { user_id, month, year },
      transaction: t,
    });

    if (existing) {
      await t.rollback();
      return res.status(400).json({
        message: "Payroll for this user and month already exists",
      });
    }

    //convert values safely
    const base = Number(salaryRecord.base_salary);
    const bonus = Number(salaryRecord.bonus || 0);
    const allowance = Number(salaryRecord.allowance || 0);
    const taxPercent = Number(salaryRecord.tax_percentage || 0);

    //calculate payroll components
    const gross = base + bonus + allowance;
    const taxAmount = (gross * taxPercent) / 100;
    const deductions = taxAmount; // For simplicity, using tax as the only deduction
    const net_salary = gross - deductions;

    //create payroll record
    const payroll = await Payroll.create(
      {
        user_id,
        month,
        year,
        base_salary: base,
        bonus,
        allowance,
        deductions,
        tax: taxAmount,
        net_salary,
        status: "pending",
      },
      { transaction: t },
    );

    await t.commit();
    res.status(201).json({
      message: "Payroll generated successfully",
      payroll,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error generating payroll:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// ================= GET ALL PAYROLL  =================
export const getPayrollDetails = async (req, res) => {
  try {
    const payrolls = await Payroll.findAll({
      include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
      order: [["created_at", "DESC"]],
    });
    res.status(200).json({
      message: "Payroll details fetched successfully",
      payrolls,
    });
  } catch (error) {
    console.error("Error fetching payroll details:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// ================= GET MY PAYROLL (for logged-in user) =================
export const getMyPayroll = async (req, res) => {
  try {
    const userId = req.user.id;
    const payrolls = await Payroll.findAll({
      where: { user_id: userId },
      order: [
        ["year", "DESC"],
        ["month", "DESC"],
      ],
    });
    res.status(200).json({
      message: "My payroll fetched successfully",
      payrolls,
    });
  } catch (error) {
    console.error("Error fetching my payroll:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// ================= APPROVE PAYROLL =================
export const approvePayroll = async (req, res) => {
  try {
    const { id } = req.params;

    const payroll = await Payroll.findByPk(id);

    if (!payroll) {
      return res.status(404).json({
        message: "Payroll not found",
      });
    }

    if (payroll.status !== "pending") {
      return res.status(400).json({
        message: "Only pending payroll can be approved",
      });
    }

    payroll.status = "approved";
    payroll.approvedAt = new Date();
    await payroll.save();

    res.status(200).json({
      message: "Payroll approved successfully",
      payroll,
    });
  } catch (error) {
    console.error("Error approving payroll:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// ================= MARK AS PAID =================
export const markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;

    const payroll = await Payroll.findByPk(id);

    if (!payroll) {
      return res.status(404).json({
        message: "Payroll not found",
      });
    }

    // IMPORTANT FLOW CONTROL
    if (payroll.status !== "approved") {
      return res.status(400).json({
        message: "Payroll must be approved first",
      });
    }

    payroll.status = "paid";
    payroll.paidAt = new Date();

    await payroll.save();

    res.status(200).json({
      message: "Payroll marked as paid",
      payroll,
    });
  } catch (error) {
    console.error("Error marking payroll paid:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
