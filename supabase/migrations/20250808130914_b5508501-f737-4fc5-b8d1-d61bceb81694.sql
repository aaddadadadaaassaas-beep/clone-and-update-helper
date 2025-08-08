-- Fix RLS policies for comments table that reference tickets table
-- First, drop the existing policies
DROP POLICY IF EXISTS "Users can create comments on accessible tickets" ON public.comments;
DROP POLICY IF EXISTS "Users can view comments on accessible tickets" ON public.comments;

-- Recreate the policies with proper table references
CREATE POLICY "Users can create comments on accessible tickets" 
ON public.comments 
FOR INSERT 
WITH CHECK (
  user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) 
  AND EXISTS (
    SELECT 1 FROM public.tickets t 
    WHERE t.id = comments.ticket_id 
    AND (
      t.submitter_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
      t.assignee_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'owner', 'employee')
      )
    )
  )
);

CREATE POLICY "Users can view comments on accessible tickets" 
ON public.comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.tickets t 
    WHERE t.id = comments.ticket_id 
    AND (
      t.submitter_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
      t.assignee_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'owner', 'employee')
      )
    )
  )
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