-- Migration: add invitation_status to users table
-- Run once against your PostgreSQL database.

DO $$
BEGIN
  -- Create the ENUM type if it doesn't already exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'enum_users_invitation_status'
  ) THEN
    CREATE TYPE "enum_users_invitation_status" AS ENUM ('sent', 'failed', 'accepted');
  END IF;
END;
$$;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS invitation_status "enum_users_invitation_status" DEFAULT NULL;
