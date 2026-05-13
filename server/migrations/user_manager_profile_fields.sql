-- ============================================================
--  User Module: Manager Profile Fields Migration
--  Run this against your PostgreSQL database before restarting server
-- ============================================================

-- 1. Add phone number for richer manager profile/edit flows
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone VARCHAR(30) NULL;

-- 2. Create the enum type Sequelize expects for users.status if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'enum_users_status'
  ) THEN
    CREATE TYPE "enum_users_status" AS ENUM ('active', 'inactive');
  END IF;
END $$;

-- 3. Add persistent active/inactive status for manager filtering and actions
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS status "enum_users_status" NOT NULL DEFAULT 'active';

-- 4. Backfill any legacy NULL values defensively
UPDATE users
SET status = 'active'
WHERE status IS NULL;