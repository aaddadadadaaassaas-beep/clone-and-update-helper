-- Atualizar o usuário atual para ser admin
UPDATE public.profiles 
SET role = 'admin', full_name = 'Admin Sistema' 
WHERE user_id = '99c71943-575e-456d-8b50-aebf291353a1';

-- Inserir usuário funcionário para teste
INSERT INTO public.profiles (id, user_id, full_name, email, role, is_active, organization, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  gen_random_uuid(), -- Gera um UUID fictício para teste
  'João Funcionário',
  'funcionario@helpdesk.com',
  'employee',
  true,
  'HelpDesk Corp',
  now(),
  now()
);