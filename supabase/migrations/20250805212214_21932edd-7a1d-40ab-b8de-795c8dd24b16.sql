-- Add avatar_url to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create in-app notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_ticket_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, ticket_id, title, message, type)
  VALUES (p_user_id, p_ticket_id, p_title, p_message, p_type)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Create trigger for comment notifications
CREATE OR REPLACE FUNCTION public.notify_comment_added()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ticket_record tickets%ROWTYPE;
  commenter_name TEXT;
BEGIN
  -- Get ticket details
  SELECT * INTO ticket_record FROM tickets WHERE id = NEW.ticket_id;
  
  -- Get commenter name
  SELECT full_name INTO commenter_name FROM profiles WHERE id = NEW.user_id;
  
  -- Notify ticket submitter if it's not the commenter
  IF ticket_record.submitter_id != NEW.user_id THEN
    PERFORM create_notification(
      ticket_record.submitter_id,
      NEW.ticket_id,
      'Novo comentário em seu ticket',
      commenter_name || ' adicionou um comentário ao ticket #' || LEFT(ticket_record.id::text, 8),
      'comment'
    );
  END IF;
  
  -- Notify assignee if it's not the commenter and different from submitter
  IF ticket_record.assignee_id IS NOT NULL 
     AND ticket_record.assignee_id != NEW.user_id 
     AND ticket_record.assignee_id != ticket_record.submitter_id THEN
    PERFORM create_notification(
      ticket_record.assignee_id,
      NEW.ticket_id,
      'Novo comentário em ticket atribuído',
      commenter_name || ' adicionou um comentário ao ticket #' || LEFT(ticket_record.id::text, 8),
      'comment'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new comments
DROP TRIGGER IF EXISTS trigger_notify_comment_added ON comments;
CREATE TRIGGER trigger_notify_comment_added
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_comment_added();