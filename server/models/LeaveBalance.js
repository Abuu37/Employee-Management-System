import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class LeaveBalance extends Model {}

LeaveBalance.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
    },
    annual: {
      type: DataTypes.INTEGER,
      defaultValue: 20,
      field: "annual_days",
    },
    sick: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
      field: "sick_days",
    },
    casual: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      field: "casual_days",
    },
  },
  {
    sequelize,
    modelName: "LeaveBalance",
    tableName: "leave_balances",
    TimeRangestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default LeaveBalance;
