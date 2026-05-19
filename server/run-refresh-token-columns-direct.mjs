import { sequelize } from "./config/db.js";

try {
  await sequelize.authenticate();

  await sequelize.query(
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS "refreshTokenHash" VARCHAR(255)',
  );
  await sequelize.query(
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS "refreshTokenExpires" TIMESTAMP WITH TIME ZONE',
  );

  const [cols] = await sequelize.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name IN ('refreshTokenHash','refreshTokenExpires') ORDER BY column_name",
  );

  console.log("Confirmed columns:", cols.map((c) => c.column_name).join(", "));

  await sequelize.close();
  process.exit(0);
} catch (err) {
  console.error("Migration failed:", err.message);
  await sequelize.close().catch(() => {});
  process.exit(1);
}
