-- Fix create_user_as_admin function to use proper enum syntax
CREATE OR REPLACE FUNCTION public.create_user_as_admin(
  user_email text, 
  user_password text, 
  user_full_name text, 
  user_role text DEFAULT 'user', 
  user_organization text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_user_id UUID;
  new_profile_id UUID;
  admin_profile RECORD;
  role_enum user_role;
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
  
  -- Converter string para enum
  role_enum := user_role::user_role;
  
  -- Gerar novos UUIDs
  new_user_id := gen_random_uuid();
  new_profile_id := gen_random_uuid();
  
  -- Inserir o perfil diretamente
  INSERT INTO public.profiles (
    id, user_id, full_name, email, role, organization, is_active
  ) VALUES (
    new_profile_id, new_user_id, user_full_name, user_email, role_enum, user_organization, true
  );
  
  RETURN new_profile_id;
END;
$$;

-- Update admin_update_user_password to work correctly
CREATE OR REPLACE FUNCTION public.admin_update_user_password(target_user_id uuid, new_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_profile RECORD;
  target_profile RECORD;
BEGIN
  -- Verificar se o usuário atual é admin/owner
  SELECT * INTO current_user_profile
  FROM public.profiles
  WHERE user_id = auth.uid()
  AND role IN ('admin', 'owner');
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Access denied: Only admins can change passwords';
  END IF;
  
  -- Buscar perfil do usuário alvo usando profile id
  SELECT * INTO target_profile
  FROM public.profiles
  WHERE id = target_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Retornar informações para o frontend
  RETURN json_build_object(
    'success', true,
    'user_id', target_profile.user_id,
    'profile_id', target_profile.id,
    'full_name', target_profile.full_name,
    'message', 'Password change authorized by admin'
  );
END;
$$;