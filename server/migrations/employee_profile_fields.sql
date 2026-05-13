-- ============================================================
--  User Module: Employee Profile Fields Migration
--  Adds structured employee profile/work metadata
-- ============================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS gender VARCHAR(30) NULL,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE NULL,
  ADD COLUMN IF NOT EXISTS address TEXT NULL,
  ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS employment_type VARCHAR(40) NULL,
  ADD COLUMN IF NOT EXISTS join_date DATE NULL;

-- Optional index for fast lookup by external employee identifier
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
