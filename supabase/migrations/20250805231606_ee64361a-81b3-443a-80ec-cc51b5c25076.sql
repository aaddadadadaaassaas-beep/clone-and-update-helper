-- Fix search_path for remaining functions
ALTER FUNCTION public.create_notification(uuid, uuid, text, text, text) SET search_path = '';
ALTER FUNCTION public.get_attachment_url(uuid) SET search_path = '';