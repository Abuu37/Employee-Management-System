import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Task extends Model {}

Task.init(
  {
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
    },

    assignedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    projectId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "project_id",
    },

    status: {
      type: DataTypes.ENUM("Pending", "In Progress", "Completed"),
      defaultValue: "Pending",
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
      field: "employee_comment",
    },
  },

  {
    sequelize,
    modelName: "Task",
    tableName: "tasks",
  },
);
export default Task;
