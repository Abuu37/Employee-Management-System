/**
 * One-shot migration: adds invitation_status column to users table.
 * Run with:  node run-invitation-status-migration.mjs
 */
import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "ems",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
});

async function run() {
  const client = await pool.connect();
  try {
    console.log("Connected to PostgreSQL. Running migration...");

    // Create the ENUM type if it doesn't already exist
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'enum_users_invitation_status'
        ) THEN
          CREATE TYPE "enum_users_invitation_status" AS ENUM ('sent', 'failed', 'accepted');
        END IF;
      END;
      $$;
    `);

    // Add the column if it doesn't already exist
    await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS invitation_status "enum_users_invitation_status" DEFAULT NULL;
    `);

    console.log(
      "✅ Migration complete: invitation_status column added to users table.",
    );
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
