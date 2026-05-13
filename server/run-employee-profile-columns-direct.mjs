import { sequelize } from "./config/db.js";

try {
  await sequelize.authenticate();

  await sequelize.query(
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50)",
  );
  await sequelize.query(
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(30)",
  );
  await sequelize.query(
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE",
  );
  await sequelize.query(
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT",
  );
  await sequelize.query(
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(120)",
  );
  await sequelize.query(
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS employment_type VARCHAR(40)",
  );
  await sequelize.query(
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS join_date DATE",
  );
  await sequelize.query(
    "CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id)",
  );

  const [cols] = await sequelize.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name IN ('employee_id','gender','date_of_birth','address','emergency_contact','employment_type','join_date') ORDER BY column_name",
  );

  console.log("Confirmed columns:", cols.map((c) => c.column_name).join(", "));

  await sequelize.close();
  process.exit(0);
} catch (err) {
  console.error("Migration failed:", err.message);
  await sequelize.close().catch(() => {});
  process.exit(1);
}
