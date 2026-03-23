import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class User extends Model {}

User.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    role: {
      type: DataTypes.ENUM("admin", "manager", "employee"),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users", // optional: force table name
  }
);

export default User;