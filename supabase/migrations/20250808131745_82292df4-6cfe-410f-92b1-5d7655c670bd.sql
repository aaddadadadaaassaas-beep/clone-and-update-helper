-- Fix functions using empty search_path and unqualified table names
-- Ensure all use schema-qualified references and search_path set to 'public'

-- 1) create_notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_ticket_id uuid,
  p_title text,
  p_message text,
  p_type text DEFAULT 'info'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- 2) get_attachment_url
CREATE OR REPLACE FUNCTION public.get_attachment_url(attachment_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  attachment_record public.attachments%ROWTYPE;
BEGIN
  SELECT * INTO attachment_record FROM public.attachments WHERE id = attachment_id;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Check if user has access to this attachment's ticket
  IF NOT EXISTS (
    SELECT 1 FROM public.tickets t
    WHERE t.id = attachment_record.ticket_id 
      AND (
        t.submitter_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
        t.assignee_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
        EXISTS (
          SELECT 1 FROM public.profiles p 
          WHERE p.user_id = auth.uid() 
            AND p.role IN ('admin', 'owner', 'employee')
        )
      )
  ) THEN
    RETURN NULL;
  END IF;
  
  -- Return the storage path for the frontend to generate signed URL
  RETURN attachment_record.storage_path;
END;
$$;

-- 3) notify_comment_added
CREATE OR REPLACE FUNCTION public.notify_comment_added()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  ticket_record public.tickets%ROWTYPE;
  commenter_name TEXT;
BEGIN
  -- Get ticket details
  SELECT * INTO ticket_record FROM public.tickets WHERE id = NEW.ticket_id;
  
  -- Get commenter name
  SELECT full_name INTO commenter_name FROM public.profiles WHERE id = NEW.user_id;
  
  -- Notify ticket submitter if it's not the commenter
  IF ticket_record.submitter_id IS NOT NULL AND ticket_record.submitter_id != NEW.user_id THEN
    PERFORM public.create_notification(
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
    PERFORM public.create_notification(
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

-- 4) log_ticket_changes (normalize search_path)
CREATE OR REPLACE FUNCTION public.log_ticket_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  profile_id UUID;
BEGIN
  -- Get the profile ID of the current user
  SELECT id INTO profile_id 
  FROM public.profiles 
  WHERE user_id = auth.uid();

  -- Handle INSERT
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.ticket_history (ticket_id, user_id, action, description)
    VALUES (NEW.id, profile_id, 'created', 'Ticket criado');
    RETURN NEW;
  END IF;

  -- Handle UPDATE
  IF TG_OP = 'UPDATE' THEN
    -- Status change
    IF OLD.status != NEW.status THEN
      INSERT INTO public.ticket_history (ticket_id, user_id, action, field_name, old_value, new_value, description)
      VALUES (NEW.id, profile_id, 'status_changed', 'status', OLD.status::text, NEW.status::text, 
              CASE 
                WHEN NEW.status = 'closed' THEN 'Ticket fechado'
                WHEN NEW.status = 'waiting' THEN 'Ticket em espera'
                WHEN NEW.status = 'open' THEN 'Ticket reaberto'
                ELSE 'Status alterado'
              END);
    END IF;

    -- Priority change
    IF OLD.priority != NEW.priority THEN
      INSERT INTO public.ticket_history (ticket_id, user_id, action, field_name, old_value, new_value, description)
      VALUES (NEW.id, profile_id, 'priority_changed', 'priority', OLD.priority::text, NEW.priority::text, 'Prioridade alterada');
    END IF;

    -- Assignment change
    IF COALESCE(OLD.assignee_id::text, '') != COALESCE(NEW.assignee_id::text, '') THEN
      INSERT INTO public.ticket_history (ticket_id, user_id, action, field_name, old_value, new_value, description)
      VALUES (NEW.id, profile_id, 'assigned', 'assignee_id', 
              COALESCE(OLD.assignee_id::text, ''), 
              COALESCE(NEW.assignee_id::text, ''), 
              CASE 
                WHEN NEW.assignee_id IS NULL THEN 'Ticket desatribuído'
                ELSE 'Ticket atribuído'
              END);
    END IF;

    -- Due date change
    IF COALESCE(OLD.due_date::text, '') != COALESCE(NEW.due_date::text, '') THEN
      INSERT INTO public.ticket_history (ticket_id, user_id, action, field_name, old_value, new_value, description)
      VALUES (NEW.id, profile_id, 'due_date_changed', 'due_date', 
              COALESCE(OLD.due_date::text, ''), 
              COALESCE(NEW.due_date::text, ''), 
              CASE 
                WHEN NEW.due_date IS NULL THEN 'Data de vencimento removida'
                ELSE 'Data de vencimento definida'
              END);
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

-- 5) auto_assign_ticket & handle_new_user & update_updated_at_column & update_updated_at_if_changed
CREATE OR REPLACE FUNCTION public.auto_assign_ticket()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_profile_id UUID;
BEGIN
  SELECT id INTO admin_profile_id
  FROM public.profiles
  WHERE role IN ('admin', 'owner')
    AND is_active = true
  ORDER BY created_at
  LIMIT 1;

  IF admin_profile_id IS NOT NULL THEN
    NEW.assignee_id := admin_profile_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    'user'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_if_changed()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.full_name IS DISTINCT FROM NEW.full_name OR
     OLD.email IS DISTINCT FROM NEW.email OR
     OLD.organization IS DISTINCT FROM NEW.organization OR
     OLD.avatar_url IS DISTINCT FROM NEW.avatar_url OR
     OLD.role IS DISTINCT FROM NEW.role OR
     OLD.is_active IS DISTINCT FROM NEW.is_active THEN
    NEW.updated_at = now();
  ELSE
    NEW.updated_at = OLD.updated_at;
  END IF;
  RETURN NEW;
END;
$$;

-- 6) Ensure check_ticket_access uses correct search_path and is present
CREATE OR REPLACE FUNCTION public.check_ticket_access(ticket_id uuid, user_auth_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_profile_id uuid;
  has_access boolean := false;
BEGIN
  SELECT id INTO user_profile_id 
  FROM public.profiles 
  WHERE user_id = user_auth_id;
  
  IF user_profile_id IS NULL THEN
    RETURN false;
  END IF;
  
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

-- 7) Recreate RLS policies for comments to ensure they use function (idempotent)
DROP POLICY IF EXISTS "Users can create comments on accessible tickets" ON public.comments;
DROP POLICY IF EXISTS "Users can view comments on accessible tickets" ON public.comments;

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

-- 8) Create trigger for notifications on new comments (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_notify_comment_added'
  ) THEN
    CREATE TRIGGER trg_notify_comment_added
    AFTER INSERT ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_comment_added();
  END IF;
END $$;
