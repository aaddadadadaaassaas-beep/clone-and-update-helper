-- Fix potential duplicate profile issue
-- First, check for duplicates and remove any
WITH duplicates AS (
  SELECT user_id, COUNT(*) as count
  FROM profiles
  GROUP BY user_id
  HAVING COUNT(*) > 1
)
DELETE FROM profiles
WHERE id IN (
  SELECT p.id
  FROM profiles p
  INNER JOIN duplicates d ON p.user_id = d.user_id
  WHERE p.id NOT IN (
    SELECT MIN(id)
    FROM profiles p2
    WHERE p2.user_id = p.user_id
  )
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);