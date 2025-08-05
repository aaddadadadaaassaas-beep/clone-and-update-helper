-- Fix foreign key constraints to use ON DELETE SET NULL
-- This prevents foreign key violations when deleting users

-- Fix tickets table - submitter_id constraint
ALTER TABLE public.tickets 
DROP CONSTRAINT IF EXISTS tickets_submitter_id_fkey;

ALTER TABLE public.tickets 
ADD CONSTRAINT tickets_submitter_id_fkey 
FOREIGN KEY (submitter_id) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;

-- Fix tickets table - assignee_id constraint  
ALTER TABLE public.tickets 
DROP CONSTRAINT IF EXISTS tickets_assignee_id_fkey;

ALTER TABLE public.tickets 
ADD CONSTRAINT tickets_assignee_id_fkey 
FOREIGN KEY (assignee_id) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;

-- Fix comments table - user_id constraint
ALTER TABLE public.comments 
DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

ALTER TABLE public.comments 
ADD CONSTRAINT comments_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;

-- Fix attachments table - user_id constraint
ALTER TABLE public.attachments 
DROP CONSTRAINT IF EXISTS attachments_user_id_fkey;

ALTER TABLE public.attachments 
ADD CONSTRAINT attachments_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;

-- Fix notifications table - user_id constraint
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- Fix ticket_history table - user_id constraint
ALTER TABLE public.ticket_history 
DROP CONSTRAINT IF EXISTS ticket_history_user_id_fkey;

ALTER TABLE public.ticket_history 
ADD CONSTRAINT ticket_history_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;

-- Fix audit_logs table - user_id constraint  
ALTER TABLE public.audit_logs 
DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;

ALTER TABLE public.audit_logs 
ADD CONSTRAINT audit_logs_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;