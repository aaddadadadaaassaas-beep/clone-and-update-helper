-- Create audit log table for tracking all changes
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create notification settings table
CREATE TABLE public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('ticket_created', 'ticket_assigned', 'ticket_updated', 'ticket_closed', 'comment_added')),
  is_enabled BOOLEAN DEFAULT true NOT NULL,
  email_template TEXT,
  recipients TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create ticket history table for detailed tracking
CREATE TABLE public.ticket_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  action TEXT NOT NULL,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on new tables
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_logs
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'owner')
    )
  );

-- RLS Policies for notification_settings
CREATE POLICY "Admins can manage notification settings" ON public.notification_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'owner')
    )
  );

-- RLS Policies for ticket_history
CREATE POLICY "Users can view history of accessible tickets" ON public.ticket_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_id
      AND (
        t.submitter_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        OR t.assignee_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE user_id = auth.uid() 
          AND role IN ('admin', 'owner', 'employee')
        )
      )
    )
  );

CREATE POLICY "System can insert ticket history" ON public.ticket_history
  FOR INSERT WITH CHECK (true);

-- Create function to automatically log ticket changes
CREATE OR REPLACE FUNCTION public.log_ticket_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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
      VALUES (NEW.id, profile_id, 'status_changed', 'status', OLD.status, NEW.status, 
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
      VALUES (NEW.id, profile_id, 'priority_changed', 'priority', OLD.priority, NEW.priority, 'Prioridade alterada');
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

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

-- Create trigger for ticket changes
CREATE TRIGGER ticket_changes_trigger
  AFTER INSERT OR UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.log_ticket_changes();

-- Create function to auto-assign tickets to first admin
CREATE OR REPLACE FUNCTION public.auto_assign_ticket()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  admin_profile_id UUID;
BEGIN
  -- Get the first admin/owner profile
  SELECT id INTO admin_profile_id
  FROM public.profiles
  WHERE role IN ('admin', 'owner')
  AND is_active = true
  ORDER BY created_at
  LIMIT 1;

  -- If we found an admin, assign the ticket
  IF admin_profile_id IS NOT NULL THEN
    NEW.assignee_id := admin_profile_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for auto-assignment
CREATE TRIGGER auto_assign_ticket_trigger
  BEFORE INSERT ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.auto_assign_ticket();

-- Add triggers for timestamp updates on new tables
CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default notification settings
INSERT INTO public.notification_settings (event_type, is_enabled, recipients) VALUES
  ('ticket_created', true, '["admins", "assignee"]'),
  ('ticket_assigned', true, '["assignee", "submitter"]'),
  ('ticket_updated', true, '["assignee", "submitter"]'),
  ('ticket_closed', true, '["submitter"]'),
  ('comment_added', true, '["assignee", "submitter"]');