-- Atualizar o usuário atual para ser admin
UPDATE public.profiles 
SET role = 'admin', full_name = 'Admin Sistema' 
WHERE user_id = '99c71943-575e-456d-8b50-aebf291353a1';

-- Para simular um funcionário, vamos temporariamente alterar o role
-- Depois você pode voltar para admin
-- UPDATE public.profiles 
-- SET role = 'employee', full_name = 'João Funcionário'
-- WHERE user_id = '99c71943-575e-456d-8b50-aebf291353a1';