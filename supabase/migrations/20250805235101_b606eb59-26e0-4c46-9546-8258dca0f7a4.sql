-- Drop and recreate admin_update_user_password function
DROP FUNCTION IF EXISTS public.admin_update_user_password(uuid, text);

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
  AND role::text IN ('admin', 'owner');
  
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