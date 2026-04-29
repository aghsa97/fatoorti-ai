-- Add contact fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text DEFAULT '';
