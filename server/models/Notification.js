import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Notification extends Model {}

Notification.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("leave", "task", "document"),
      allowNull: false,
    },
    refId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "ref_id",
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_read",
    },
  },
  {
    sequelize,
    modelName: "Notification",
    tableName: "notifications",
    timestamps: true,
    underscored: false,
  },
);

export default Notification;
