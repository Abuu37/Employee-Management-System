import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  "ems",
  "postgres",
  "abuu@2001",
  {
    host: "localhost",
    port: 5432,
    dialect: "postgres",
    logging: false,
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected successfully");
  } catch (error) {
    console.error("DB connection failed:", error);
  }
};