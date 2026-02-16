-- Rollback Migration: Drop waitlist table

-- Drop trigger first
DROP TRIGGER IF EXISTS update_waitlist_updated_at ON waitlist;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop indexes (will be dropped automatically with table, but explicit for clarity)
DROP INDEX IF EXISTS idx_waitlist_created_at;
DROP INDEX IF EXISTS idx_waitlist_email_lower;

-- Drop table
DROP TABLE IF EXISTS waitlist;
