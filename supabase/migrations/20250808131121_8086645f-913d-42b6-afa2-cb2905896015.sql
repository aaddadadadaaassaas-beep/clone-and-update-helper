-- Create security definer function to check ticket access
CREATE OR REPLACE FUNCTION public.check_ticket_access(ticket_id uuid, user_auth_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_profile_id uuid;
  has_access boolean := false;
BEGIN
  -- Get user profile id
  SELECT id INTO user_profile_id 
  FROM public.profiles 
  WHERE user_id = user_auth_id;
  
  IF user_profile_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user has access to ticket
  SELECT EXISTS(
    SELECT 1 FROM public.tickets t 
    WHERE t.id = ticket_id 
    AND (
      t.submitter_id = user_profile_id OR
      t.assignee_id = user_profile_id OR
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = user_profile_id 
        AND p.role IN ('admin', 'owner', 'employee')
      )
    )
  ) INTO has_access;
  
  RETURN has_access;
END;
$$;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create comments on accessible tickets" ON public.comments;
DROP POLICY IF EXISTS "Users can view comments on accessible tickets" ON public.comments;

-- Create new policies using the security definer function
CREATE POLICY "Users can create comments on accessible tickets" 
ON public.comments 
FOR INSERT 
WITH CHECK (
  user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) 
  AND public.check_ticket_access(ticket_id, auth.uid())
);

CREATE POLICY "Users can view comments on accessible tickets" 
ON public.comments 
FOR SELECT 
USING (
  public.check_ticket_access(ticket_id, auth.uid())
  AND (
    is_private = false OR
    user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'owner', 'employee')
    )
  )
);