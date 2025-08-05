import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'owner' | 'admin' | 'employee' | 'user' }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Perfil atualizado',
        description: 'O perfil do usuário foi atualizado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar perfil',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', userId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: data?.is_active ? 'Usuário ativado' : 'Usuário desativado',
        description: `O usuário foi ${data?.is_active ? 'ativado' : 'desativado'} com sucesso.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao alterar status',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userId: string) => {
      // Use the safe delete function from the database
      const { data, error } = await supabase.rpc('delete_user_safely', {
        target_user_id: userId
      });

      if (error) throw error;

      // Get profile name for toast message
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .maybeSingle();

      return profile;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Usuário excluído',
        description: `${data.full_name} foi removido do sistema.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir usuário',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
};

export const useEditUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, userData }: { 
      userId: string; 
      userData: { full_name: string; email: string; organization?: string } 
    }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', userId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Usuário editado',
        description: 'As informações do usuário foram atualizadas com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao editar usuário',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
};