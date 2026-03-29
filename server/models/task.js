import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Task extends Model {}

Task.init(
  {
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "project_id",
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "assigned_to",
    },

    assignedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "created_by",
    },

    status: {
      type: DataTypes.ENUM("pending", "in_progress", "completed"),
      defaultValue: "pending",
    },

    priority: {
      type: DataTypes.ENUM("Low", "Medium", "High"),
      defaultValue: "Medium",
    },

    deadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    employeeComment: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "comments",
    },
  },
  {
    sequelize,
    modelName: "Task",
    tableName: "tasks",
  },
);

export default Task;
