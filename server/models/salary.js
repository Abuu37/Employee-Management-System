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
      field: "user_id",
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

    tax_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: "tax_percentage",
    },
  },

  {
    sequelize,
    modelName: "Salary",
    tableName: "salaries",
    timestamps: true,
    underscored: true,
  },
);

export default Salary;
