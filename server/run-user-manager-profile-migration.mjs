import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { sequelize } from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationPath = path.join(
  __dirname,
  "migrations",
  "user_manager_profile_fields.sql",
);

try {
  const sql = await readFile(migrationPath, "utf8");
  await sequelize.authenticate();
  await sequelize.query(sql);
  console.log("User manager profile migration applied successfully.");
  await sequelize.close();
  process.exit(0);
} catch (error) {
  console.error("Failed to apply user manager profile migration:");
  console.error(error);
  await sequelize.close().catch(() => {});
  process.exit(1);
}