import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useChangeUserPassword = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      console.log('Attempting to change password for user:', userId);
      
      const { data, error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword
      });

      if (error) {
        console.error('Password change error:', error);
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