-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('owner', 'admin', 'employee', 'user');

-- Create ticket status enum  
CREATE TYPE public.ticket_status AS ENUM ('open', 'waiting', 'closed');

-- Create ticket priority enum
CREATE TYPE public.ticket_priority AS ENUM ('low', 'normal', 'high', 'urgent');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role DEFAULT 'user' NOT NULL,
  organization TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create tickets table
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status ticket_status DEFAULT 'open' NOT NULL,
  priority ticket_priority DEFAULT 'normal' NOT NULL,
  category_id UUID REFERENCES public.categories(id) NOT NULL,
  submitter_id UUID REFERENCES public.profiles(id) NOT NULL,
  assignee_id UUID REFERENCES public.profiles(id),
  due_date TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create attachments table
CREATE TABLE public.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'owner')
    )
  );

-- RLS Policies for categories
CREATE POLICY "Everyone can view categories" ON public.categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'owner')
    )
  );

-- RLS Policies for tickets
CREATE POLICY "Users can view tickets they're involved in" ON public.tickets
  FOR SELECT USING (
    submitter_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR assignee_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'owner', 'employee')
    )
  );

CREATE POLICY "Authenticated users can create tickets" ON public.tickets
  FOR INSERT WITH CHECK (
    submitter_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Staff can update tickets" ON public.tickets
  FOR UPDATE USING (
    assignee_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'owner', 'employee')
    )
  );

-- RLS Policies for comments
CREATE POLICY "Users can view comments on accessible tickets" ON public.comments
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
    AND (
      is_private = false
      OR user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'owner', 'employee')
      )
    )
  );

CREATE POLICY "Users can create comments on accessible tickets" ON public.comments
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    AND EXISTS (
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

-- RLS Policies for attachments
CREATE POLICY "Users can view attachments on accessible tickets" ON public.attachments
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

CREATE POLICY "Users can upload attachments on accessible tickets" ON public.attachments
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    AND EXISTS (
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

-- Insert default categories
INSERT INTO public.categories (name, description, color) VALUES
  ('Técnico', 'Problemas técnicos e suporte de TI', '#ef4444'),
  ('Financeiro', 'Questões relacionadas a pagamentos e faturamento', '#22c55e'),
  ('Comercial', 'Suporte de vendas e atendimento comercial', '#3b82f6'),
  ('RH', 'Recursos humanos e questões trabalhistas', '#f59e0b'),
  ('Geral', 'Outras solicitações gerais', '#8b5cf6');

-- Create storage bucket for attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ticket-attachments', 'ticket-attachments', false);

-- Storage policies for ticket attachments
CREATE POLICY "Users can view attachments they have access to" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'ticket-attachments'
    AND EXISTS (
      SELECT 1 FROM public.attachments a
      JOIN public.tickets t ON a.ticket_id = t.id
      WHERE a.file_path = name
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

CREATE POLICY "Authenticated users can upload attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'ticket-attachments'
    AND auth.uid() IS NOT NULL
  );