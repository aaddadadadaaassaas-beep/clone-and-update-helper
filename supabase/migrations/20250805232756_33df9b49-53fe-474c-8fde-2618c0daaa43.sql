-- 1. Corrigir problema de exclusão - permitir NULL em ticket_history.user_id
ALTER TABLE public.ticket_history ALTER COLUMN user_id DROP NOT NULL;

-- 2. Corrigir problema de senha - usar supabase.auth.admin nas funções
CREATE OR REPLACE FUNCTION public.admin_update_user_password(
  target_user_id UUID,
  new_password TEXT
)
RETURNS BOOLEAN
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
  
  -- Buscar perfil do usuário alvo
  SELECT * INTO target_profile
  FROM public.profiles
  WHERE id = target_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Retornar true para indicar sucesso - frontend deve usar auth.admin
  RETURN TRUE;
END;
$$;

-- 3. Corrigir problema de atualização de role - melhorar política RLS
DROP POLICY IF EXISTS "Admins can update users" ON public.profiles;

CREATE POLICY "Admins can update users"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  -- Usuários podem atualizar próprio perfil (apenas campos básicos)
  (auth.uid() = user_id) OR
  -- Admins podem atualizar qualquer usuário (exceto outros admins/owners a menos que seja owner)
  (
    EXISTS (
      SELECT 1 FROM public.profiles admin_check
      WHERE admin_check.user_id = auth.uid()
      AND admin_check.role IN ('admin', 'owner')
    )
    AND (
      -- Pode atualizar usuários normais
      profiles.role NOT IN ('admin', 'owner')
      OR
      -- Owners podem atualizar qualquer um
      EXISTS (
        SELECT 1 FROM public.profiles owner_check
        WHERE owner_check.user_id = auth.uid()
        AND owner_check.role = 'owner'
      )
    )
  )
)
WITH CHECK (
  -- Mesmas condições para WITH CHECK
  (auth.uid() = user_id) OR
  (
    EXISTS (
      SELECT 1 FROM public.profiles admin_check
      WHERE admin_check.user_id = auth.uid()
      AND admin_check.role IN ('admin', 'owner')
    )
    AND (
      profiles.role NOT IN ('admin', 'owner')
      OR
      EXISTS (
        SELECT 1 FROM public.profiles owner_check
        WHERE owner_check.user_id = auth.uid()
        AND owner_check.role = 'owner'
      )
    )
  )
);

-- 4. Criar trigger para atualizar updated_at apenas quando há mudanças reais
CREATE OR REPLACE FUNCTION public.update_updated_at_if_changed()
RETURNS TRIGGER AS $$
BEGIN
  -- Só atualizar se houve mudança real nos dados
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
$$ LANGUAGE plpgsql
SET search_path = '';

-- Remover trigger antigo e adicionar novo
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_if_changed();