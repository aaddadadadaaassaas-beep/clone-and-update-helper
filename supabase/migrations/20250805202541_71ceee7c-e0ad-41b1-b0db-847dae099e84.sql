-- Atualizar função de histórico para incluir mudanças de due_date
CREATE OR REPLACE FUNCTION public.log_ticket_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;