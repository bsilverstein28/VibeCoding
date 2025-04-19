-- Add email field to user_preferences table
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS email VARCHAR(255);
