import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Leave extends Model {}

Leave.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, field: "user_id" },
    type: {
      type: DataTypes.ENUM("annual", "sick", "casual"),
      allowNull: false,
    },

    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "start_date",
    },
    
    endDate: { type: DataTypes.DATEONLY, allowNull: false, field: "end_date" },
    reason: { type: DataTypes.STRING, allowNull: true },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    days: { type: DataTypes.INTEGER, allowNull: false },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "approved_by",
    },
    approvedAt: { type: DataTypes.DATE, allowNull: true, field: "approved_at" },
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
