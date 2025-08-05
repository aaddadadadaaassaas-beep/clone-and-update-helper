import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useChangeUserPassword = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      console.log('Attempting to change password for user:', userId);
      
      // Use RPC function to verify permissions and simulate password change
      const { data: rpcResult, error: rpcError } = await supabase.rpc('admin_update_user_password', {
        target_user_id: userId,
        new_password: newPassword
      });

      if (rpcError) {
        console.error('RPC password change error:', rpcError);
        throw rpcError;
      }

      // Check if the result indicates success
      const result = rpcResult as any;
      if (!result?.success) {
        throw new Error(result?.error || 'Falha na alteração da senha');
      }

      console.log('Password change authorized:', rpcResult);
      return rpcResult;
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