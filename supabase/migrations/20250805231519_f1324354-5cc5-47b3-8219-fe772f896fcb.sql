-- Fix search_path security issues for remaining functions
ALTER FUNCTION public.notify_comment_added() SET search_path = '';
ALTER FUNCTION public.log_ticket_changes() SET search_path = '';
ALTER FUNCTION public.auto_assign_ticket() SET search_path = '';