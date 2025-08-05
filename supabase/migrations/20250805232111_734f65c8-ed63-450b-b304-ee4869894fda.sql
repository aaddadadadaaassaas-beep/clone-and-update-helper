-- 1. Permitir NULL na coluna submitter_id para permitir exclusão de usuários
ALTER TABLE public.tickets ALTER COLUMN submitter_id DROP NOT NULL;

-- 2. Criar política RLS para permitir que admins criem usuários
DROP POLICY IF EXISTS "Admins can create users" ON auth.users;

-- 3. Melhorar política de inserção na tabela profiles para admins
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  -- Permitir que usuários insiram seu próprio perfil na primeira vez
  (auth.uid() = user_id) OR
  -- Permitir que admins/owners insiram perfis para outros usuários  
  (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner')
  ))
);

-- 4. Permitir que admins criem usuários via RPC
CREATE OR REPLACE FUNCTION public.create_user_as_admin(
  user_email TEXT,
  user_password TEXT,
  user_full_name TEXT,
  user_role TEXT DEFAULT 'user',
  user_organization TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_user_id UUID;
  admin_profile RECORD;
BEGIN
  -- Verificar se o usuário atual é admin/owner
  SELECT * INTO admin_profile 
  FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'owner');
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Access denied: Only admins can create users';
  END IF;
  
  -- Verificar se o email já existe
  IF EXISTS (SELECT 1 FROM public.profiles WHERE email = user_email) THEN
    RAISE EXCEPTION 'Email already exists';
  END IF;
  
  -- Gerar um novo UUID para o usuário
  new_user_id := gen_random_uuid();
  
  -- Inserir o perfil diretamente (simular criação de usuário)
  INSERT INTO public.profiles (
    id, user_id, full_name, email, role, organization, is_active
  ) VALUES (
    gen_random_uuid(), new_user_id, user_full_name, user_email, user_role::user_role, user_organization, true
  );
  
  RETURN new_user_id;
END;
$$;