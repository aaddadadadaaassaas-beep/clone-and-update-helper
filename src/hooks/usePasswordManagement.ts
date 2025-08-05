import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useChangeUserPassword = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      console.log('Attempting to change password for user:', userId);
      
      // Primeiro, verificar RPC function
      const { data: rpcResult, error: rpcError } = await supabase.rpc('admin_update_user_password', {
        target_user_id: userId,
        new_password: newPassword
      });

      if (rpcError) {
        console.error('RPC password change error:', rpcError);
        throw rpcError;
      }

      // Buscar o user_id do perfil para usar no auth.admin
      const { data: profileData } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('id', userId)
        .single();

      if (!profileData) {
        throw new Error('Usuário não encontrado');
      }

      // Usar supabase.auth.admin para realmente alterar a senha
      const { data, error } = await supabase.auth.admin.updateUserById(profileData.user_id, {
        password: newPassword
      });

      if (error) {
        console.error('Auth admin password change error:', error);
        throw error;
      }
      
      console.log('Password changed successfully:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      console.log('Password change mutation success');
      toast({
        title: 'Senha alterada',
        description: `A senha foi alterada com sucesso. Nova senha: ${variables.newPassword}`,
      });
    },
    onError: (error: any) => {
      console.error('Password change mutation error:', error);
      toast({
        title: 'Erro ao alterar senha',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
};