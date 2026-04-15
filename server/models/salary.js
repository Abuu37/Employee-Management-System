import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Salary extends Model {}

Salary.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: "user_id",
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

    tax_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      field: "tax_percentage",
    },
  },
  {
    sequelize,
    modelName: "Salary",
    tableName: "salaries",
    timestamps: true,
    underscored: true,
  }
);

export default Salary;