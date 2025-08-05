import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useChangeUserPassword = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      console.log('Attempting to change password for user:', userId);
      
      // Use RPC function that now returns JSON
      const { data: result, error: rpcError } = await supabase.rpc('admin_update_user_password', {
        target_user_id: userId,
        new_password: newPassword
      });

      if (rpcError) {
        console.error('RPC password change error:', rpcError);
        throw rpcError;
      }

      console.log('Password change authorized:', result);
      return result;
    },
    onSuccess: (data, variables) => {
      console.log('Password change mutation success:', data);
      const result = data as any;
      toast({
        title: 'Senha alterada',
        description: `A senha de ${result?.full_name || 'usuário'} foi alterada com sucesso.`,
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