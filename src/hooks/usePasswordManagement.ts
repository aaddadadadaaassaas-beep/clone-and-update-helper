import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useChangeUserPassword = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      const { data, error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Senha alterada',
        description: 'A senha do usuário foi alterada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao alterar senha',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
};