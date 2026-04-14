import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Payroll extends Model {}

Payroll.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
    },

    month: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "month",
    },

    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "year",
    },

    base_salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "base_salary",
    },

    bonus: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: "bonus",
    },

    allowance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: "allowance",
    },

    deductions: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: "deductions",
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: "tax",
    },
    // ...existing code...
    net_salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "net_salary",
    },

    status: {
      type: DataTypes.ENUM("pending", "approved", "paid"),
      defaultValue: "pending",
      field: "status",
    },
  },
  {
    sequelize,
    modelName: "Payroll",
    tableName: "payrolls",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default Payroll;
