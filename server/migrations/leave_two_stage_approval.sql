-- ============================================================
--  Leave Module: Two-Stage Approval Migration
--  Run this against your MySQL database before restarting server
-- ============================================================

-- 1. Extend the leave type ENUM to include emergency & unpaid
ALTER TABLE leaves
  MODIFY COLUMN type ENUM('annual','sick','casual','emergency','unpaid') NOT NULL;

-- 2. Remove old single-stage columns (back up data first if needed)
ALTER TABLE leaves
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS approved_by,
  DROP COLUMN IF EXISTS approved_at;

-- 3. Add handover / backup fields
ALTER TABLE leaves
  ADD COLUMN IF NOT EXISTS backup_employee_id INT NULL,
  ADD COLUMN IF NOT EXISTS handover_note      TEXT NULL;

-- 4. Add manager-stage decision columns
ALTER TABLE leaves
  ADD COLUMN IF NOT EXISTS manager_status      ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS manager_comment     VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS manager_approved_at DATETIME NULL;

-- 5. Add HR-stage decision columns
ALTER TABLE leaves
  ADD COLUMN IF NOT EXISTS hr_status      ENUM('pending','approved','rejected') NULL,
  ADD COLUMN IF NOT EXISTS hr_comment     VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS hr_approved_at DATETIME NULL;

-- 6. Add overall_status column (what the employee sees)
ALTER TABLE leaves
  ADD COLUMN IF NOT EXISTS overall_status
    ENUM('pending_manager','pending_hr','approved','rejected_by_manager','rejected_by_hr')
    NOT NULL DEFAULT 'pending_manager';

-- 7. Add foreign key for backup employee (optional – skip if FK management is done via app)
ALTER TABLE leaves
  ADD CONSTRAINT fk_leave_backup_employee
  FOREIGN KEY (backup_employee_id) REFERENCES users(id) ON DELETE SET NULL;

-- 8. Useful index
CREATE INDEX IF NOT EXISTS idx_leaves_overall_status ON leaves (overall_status);
CREATE INDEX IF NOT EXISTS idx_leaves_user_id        ON leaves (user_id);
