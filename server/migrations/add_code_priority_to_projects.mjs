import { sequelize } from "../config/db.js";

await sequelize.query(`
  ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS code VARCHAR(100),
    ADD COLUMN IF NOT EXISTS priority VARCHAR(10) NOT NULL DEFAULT 'medium';
`);
console.log("Migration done: added code and priority columns to projects.");
process.exit(0);
