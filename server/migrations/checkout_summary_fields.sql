-- Migration: Add checkout summary fields to attendances and completed_at to tasks
-- Run this against your database before starting the server

ALTER TABLE attendances
  ADD COLUMN work_summary TEXT NULL,
  ADD COLUMN notes TEXT NULL,
  ADD COLUMN completed_task_ids JSON NULL;

ALTER TABLE tasks
  ADD COLUMN completed_at TIMESTAMP NULL;
