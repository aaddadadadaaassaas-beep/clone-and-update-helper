-- Inserir usuário administrador
INSERT INTO public.profiles (id, user_id, full_name, email, role, is_active, organization, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '99c71943-575e-456d-8b50-aebf291353a1', -- Use o user_id do usuário atual logado
  'Admin Sistema',
  'admin@helpdesk.com',
  'admin',
  true,
  'HelpDesk Corp',
  now(),
  now()
);

-- Inserir usuário funcionário
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

-- Atualizar o usuário atual para ser admin (caso ainda não seja)
UPDATE public.profiles 
SET role = 'admin' 
WHERE user_id = '99c71943-575e-456d-8b50-aebf291353a1';