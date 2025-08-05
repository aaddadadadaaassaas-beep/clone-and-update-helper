-- Fix potential duplicate profile issue with correct UUID handling
DELETE FROM profiles 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM profiles
  ORDER BY user_id, created_at ASC
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);