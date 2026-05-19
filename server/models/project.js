import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Project extends Model {}

Project.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    code: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "code",
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      defaultValue: "medium",
      allowNull: false,
    },

    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "created_by",
    },

    managerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "manager_id",
    },

    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "start_date",
    },

    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "end_date",
    },

    status: {
      type: DataTypes.ENUM("pending", "in_progress", "complete"),
      defaultValue: "pending",
    },
  },
  {
    sequelize,
    modelName: "Project",
    tableName: "projects",
  },
);

export default Project;
