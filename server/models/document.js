import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Document extends Model {}

Document.init(
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

    file_name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "file_name",
    },

    file_path: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "file_path",
    },

    file_type: {
      type: DataTypes.ENUM(
        "contract",
        "id",
        "cv",
        "certificate",
        "performance_report",
        "evaluation",
      ),
      allowNull: false,
      field: "file_type",
    },

    uploaded_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "uploaded_by",
    },

    visibility: {
      type: DataTypes.ENUM("private", "team", "admin"),
      defaultValue: "private",
      field: "visibility",
    },

    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_verified",
    },
  },
  {
    sequelize,
    modelName: "Document",
    tableName: "documents",
    timestamps: true,
    underscored: true,
  },
);

export default Document;
