import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Leave extends Model {}

Leave.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, field: "user_id" },
    type: {
      type: DataTypes.ENUM("annual", "sick", "casual", "emergency", "unpaid"),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "start_date",
    },
    endDate: { type: DataTypes.DATEONLY, allowNull: false, field: "end_date" },
    days: { type: DataTypes.INTEGER, allowNull: false },
    reason: { type: DataTypes.TEXT, allowNull: true },
    backupEmployeeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "backup_employee_id",
    },
    handoverNote: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "handover_note",
    },

    // Manager decision
    managerStatus: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
      field: "manager_status",
    },
    managerComment: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: "manager_comment",
    },
    managerApprovedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "manager_approved_at",
    },

    // HR decision
    hrStatus: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      allowNull: true,
      field: "hr_status",
    },
    hrComment: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: "hr_comment",
    },
    hrApprovedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "hr_approved_at",
    },

    // Overall status (drives what the employee sees)
    overallStatus: {
      type: DataTypes.ENUM(
        "pending_manager",
        "pending_hr",
        "approved",
        "rejected_by_manager",
        "rejected_by_hr",
      ),
      defaultValue: "pending_manager",
      field: "overall_status",
    },

    createdAt: { type: DataTypes.DATE, allowNull: true, field: "created_at" },
    updatedAt: { type: DataTypes.DATE, allowNull: true, field: "updated_at" },
  },
  {
    sequelize,
    modelName: "Leave",
    tableName: "leaves",
    timestamps: true,
    underscored: true,
  },
);

export default Leave;
