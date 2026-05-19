import { Sequelize } from "sequelize";
import { env } from "./env.js";

export const sequelize = new Sequelize(
  env.db.name,
  env.db.user,
  env.db.password,
  {
    host: env.db.host,
    port: env.db.port,
    dialect: "postgres",
    logging: false,
  },
);

export const connectDB = async () => {
  await sequelize.authenticate();
  console.log("PostgreSQL connected successfully");
};
