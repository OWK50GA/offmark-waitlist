-- Migration: Create waitlist table
-- Requirements: 4.2, 3.3

-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(254) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE waitlist
ADD COLUMN first_name VARCHAR(50);

CREATE INDEX idx_waitlist_first_name ON waitlist (first_name);

-- Add unique constraint on lowercase email for case-insensitive uniqueness
CREATE UNIQUE INDEX idx_waitlist_email_lower ON waitlist (LOWER(email));

-- Add index on created_at for efficient sorting
CREATE INDEX idx_waitlist_created_at ON waitlist (created_at DESC);

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_waitlist_updated_at
    BEFORE UPDATE ON waitlist
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
