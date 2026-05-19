-- PostgreSQL hardening and integrity migration
-- Run in production via controlled migration process.

BEGIN;

-- 1) Attendance integrity: one attendance record per user per day
CREATE UNIQUE INDEX IF NOT EXISTS uq_attendance_user_date
  ON attendances (user_id, date);

-- 2) Frequent lookup indexes
CREATE INDEX IF NOT EXISTS idx_leaves_user_status
  ON leaves (user_id, overall_status);

CREATE INDEX IF NOT EXISTS idx_payroll_user_period
  ON payrolls (user_id, year, month);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read
  ON notifications (user_id, is_read);

-- 3) Foreign key constraints (added defensively)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_leaves_user_id'
  ) THEN
    ALTER TABLE leaves
      ADD CONSTRAINT fk_leaves_user_id
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_leaves_backup_employee_id'
  ) THEN
    ALTER TABLE leaves
      ADD CONSTRAINT fk_leaves_backup_employee_id
      FOREIGN KEY (backup_employee_id) REFERENCES users(id)
      ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_attendance_user_id'
  ) THEN
    ALTER TABLE attendances
      ADD CONSTRAINT fk_attendance_user_id
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_documents_user_id'
  ) THEN
    ALTER TABLE documents
      ADD CONSTRAINT fk_documents_user_id
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_documents_uploaded_by'
  ) THEN
    ALTER TABLE documents
      ADD CONSTRAINT fk_documents_uploaded_by
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
      ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_notifications_user_id'
  ) THEN
    ALTER TABLE notifications
      ADD CONSTRAINT fk_notifications_user_id
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE;
  END IF;
END $$;

COMMIT;
