import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  "Emplyeems", // Make sure this database exists in MySQL
  "root",      // MySQL username
  "",          // MySQL password
  {
    host: "localhost",
    dialect: "mysql",
    logging: false, // optional: remove SQL logs
  }
);

// Test the connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export { sequelize, connectDB };