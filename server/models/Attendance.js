import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Attendance extends Model {}

Attendance.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    check_in: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    check_out: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    total_hours: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("present", "late", "absent", "half_day"),
      allowNull: false,
      defaultValue: "present",
    },
  },
  {
    sequelize,
    tableName: "attendances",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default Attendance;
