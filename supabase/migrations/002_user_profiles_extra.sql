-- Add profile info columns to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS date_of_birth TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT FALSE;
