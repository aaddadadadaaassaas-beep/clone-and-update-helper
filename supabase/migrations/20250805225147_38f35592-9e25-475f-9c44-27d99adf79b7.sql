-- Fix admin deletion RLS policy to allow admins to delete users
DROP POLICY IF EXISTS "Admins can delete users" ON public.profiles;

-- Allow admins to delete users (except other admins/owners)
CREATE POLICY "Admins can delete users"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  -- Must be admin/owner to delete
  EXISTS (
    SELECT 1 FROM public.profiles admin_check
    WHERE admin_check.user_id = auth.uid()
    AND admin_check.role IN ('admin', 'owner')
  )
  -- Cannot delete other admins/owners unless you're an owner
  AND (
    profiles.role NOT IN ('admin', 'owner')
    OR EXISTS (
      SELECT 1 FROM public.profiles owner_check
      WHERE owner_check.user_id = auth.uid()
      AND owner_check.role = 'owner'
    )
  )
);

-- Fix admin update policy to allow admins to update any user except other admins
DROP POLICY IF EXISTS "Admins can update users" ON public.profiles;

CREATE POLICY "Admins can update users"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  -- Can update own profile
  auth.uid() = user_id
  OR
  -- Admins can update users (but not other admins unless owner)
  (
    EXISTS (
      SELECT 1 FROM public.profiles admin_check
      WHERE admin_check.user_id = auth.uid()
      AND admin_check.role IN ('admin', 'owner')
    )
    AND (
      profiles.role NOT IN ('admin', 'owner')
      OR EXISTS (
        SELECT 1 FROM public.profiles owner_check
        WHERE owner_check.user_id = auth.uid()
        AND owner_check.role = 'owner'
      )
    )
  )
);

-- Create function to safely delete user including auth user
CREATE OR REPLACE FUNCTION public.delete_user_safely(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_profile RECORD;
  current_user_profile RECORD;
BEGIN
  -- Get current user profile
  SELECT * INTO current_user_profile
  FROM public.profiles
  WHERE user_id = auth.uid();
  
  -- Check if current user is admin/owner
  IF current_user_profile.role NOT IN ('admin', 'owner') THEN
    RAISE EXCEPTION 'Access denied: Only admins can delete users';
  END IF;
  
  -- Get target user profile
  SELECT * INTO target_profile
  FROM public.profiles
  WHERE id = target_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Prevent non-owners from deleting admins/owners
  IF target_profile.role IN ('admin', 'owner') AND current_user_profile.role != 'owner' THEN
    RAISE EXCEPTION 'Access denied: Only owners can delete admins';
  END IF;
  
  -- Delete from auth.users (will cascade to profiles)
  DELETE FROM auth.users WHERE id = target_profile.user_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error deleting user: %', SQLERRM;
END;
$$;