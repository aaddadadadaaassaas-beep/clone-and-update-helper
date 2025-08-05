import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTickets = (filterByUser = false) => {
  return useQuery({
    queryKey: ['tickets', filterByUser],
    queryFn: async () => {
      let query = supabase
        .from('tickets')
        .select(`
          *,
          category:categories(*),
          submitter:profiles!tickets_submitter_id_fkey(full_name, email, user_id),
          assignee:profiles!tickets_assignee_id_fkey(full_name, email, user_id)
        `);

      if (filterByUser) {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Get user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, role')
            .eq('user_id', user.id)
            .single();

          if (profile) {
            // If employee or user role, filter to only their tickets
            if (profile.role === 'employee' || profile.role === 'user') {
              query = query.or(`submitter_id.eq.${profile.id},assignee_id.eq.${profile.id}`);
            }
            // Admin and owner can see all tickets (no filter)
          }
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    },
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (ticketData: {
      title: string;
      description: string;
      category_id: string;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
    }) => {
      // Get current user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      const { data, error } = await supabase
        .from('tickets')
        .insert({
          ...ticketData,
          submitter_id: profile.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast({
        title: 'Ticket criado com sucesso!',
        description: 'Seu ticket foi registrado e será processado em breve.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar ticket',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast({
        title: 'Ticket atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar ticket',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
};