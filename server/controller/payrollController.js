import Payroll from "../models/payroll.js";
import Salary from "../models/salary.js";
import { Op } from "sequelize";

//Generate payroll
export const generatePayroll = async (req, res) => {
  try {
    const { user_id, month, year } = req.body;

    //check salary
    const salaryRecord = await Salary.findOne({ where: { user_id } });
    if (!salaryRecord) {
      return res
        .status(404)
        .json({ error: "Salary details not found for the user" });
    }

    //Prevent duplicate payroll generation
    const existing = await Payroll.findOne({
      where: { user_id, month, year },
    });

    if (existing) {
      return res.status(400).json({
        message: "Payroll already generated for this month and year",
      });
    }

    //Extract salary details
    const base = parseFloat(salaryRecord.base_salary);
    const bonus = parseFloat(salaryRecord.bonus) || 0;
    const allowance = parseFloat(salaryRecord.allowance) || 0;
    const tax = parseFloat(salaryRecord.tax_percentage) || 0;

    //calculate
    const gross = base + bonus + allowance;
    const taxAmount = (gross * tax) / 100;
    const deductions = taxAmount;
    const net_salary = gross - deductions;

    //Save payroll record
    const payrollRecord = await Payroll.create({
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
    });
    res.json({
      message: "Payroll generated successfully",
      payroll: payrollRecord,
    });
  } catch (error) {
    console.error("Error generating payroll:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating payroll" });
  }
};

//Get payroll details
export const getPayrollDetails = async (req, res) => {
  try {
    const payrollDetails = await Payroll.findAll({
      order: [["created_at", "DESC"]],
    });
    res.json(payrollDetails);
  } catch (error)
   {
    console.error("Error fetching payroll details:", error);
    res.status(500).json({
      error: "An error occurred while fetching payroll details",
    });
  }
};

//Approval of payroll
export const approvePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const payrollRecord = await Payroll.findByPk(id);
    if (!payrollRecord) {
      return res.status(404).json({ error: "Payroll record not found" });
    }

    payrollRecord.status = "approved";
    await payrollRecord.save();
    res.json({
      message: "Payroll approved successfully",
      payroll: payrollRecord,
    });
  } catch (error) {
    console.error("Error approving payroll:", error);
    res.status(500).json({
      error: "An error occurred while approving payroll",
    });
  }
};

//Mark as paid
export const markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const payrollRecord = await Payroll.findByPk(id);
    if (!payrollRecord) {
      return res.status(404).json({
        error: "Payroll record not found",
      });
    }
    payrollRecord.status = "paid";
    await payrollRecord.save();
    res.json({
      message: "Payroll marked as paid successfully",
      payroll: payrollRecord,
    });
  } catch (error) {
    console.error("Error marking payroll as paid:", error);
    res.status(500).json({
      error: "An error occurred while marking payroll as paid",
    });
  }
};
