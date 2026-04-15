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

    // Better to use INTEGER (optional but recommended)
    month: {
      type: DataTypes.INTEGER, // 1 - 12 (better than string)
      allowNull: false,
      field: "month",
      validate: {
        min: 1,
        max: 12,
      },
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
      defaultValue: 0,
      field: "bonus",
    },

    allowance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: "allowance",
    },

    deductions: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: "deductions",
    },

    tax: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: "tax",
    },

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

    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "approved_at",
    },

    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "paid_at",
    },
  },
  {
    sequelize,
    modelName: "Payroll",
    tableName: "payrolls",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",

    // Prevent duplicate payroll (VERY IMPORTANT)
    indexes: [
      {
        unique: true,
        fields: ["user_id", "month", "year"],
      },
    ],
  }
);

export default Payroll;