import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTickets = (view?: 'all' | 'my-tickets' | 'waiting' | 'closed' | 'high-priority') => {
  return useQuery({
    queryKey: ['tickets', view],
    queryFn: async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      let query = supabase
        .from('tickets')
        .select(`
          *,
          category:categories(*),
          submitter:profiles!tickets_submitter_id_fkey(full_name, email, user_id),
          assignee:profiles!tickets_assignee_id_fkey(full_name, email, user_id)
        `);

      // Apply role-based filtering
      if (profile.role === 'user') {
        // Users can only see their own tickets (submitted by them)
        query = query.eq('submitter_id', profile.id);
      } else if (profile.role === 'employee') {
        // Employees can see tickets submitted by them or assigned to them
        query = query.or(`submitter_id.eq.${profile.id},assignee_id.eq.${profile.id}`);
      }
      // Admin and owner can see all tickets (no additional filter)

      // Apply view-specific filters if provided
      if (view) {
        switch (view) {
          case 'my-tickets':
            // For my-tickets view, show tickets user is involved in
            if (profile.role === 'admin' || profile.role === 'owner') {
              query = query.or(`submitter_id.eq.${profile.id},assignee_id.eq.${profile.id}`);
            }
            break;
          case 'waiting':
            query = query.eq('status', 'waiting');
            break;
          case 'closed':
            query = query.eq('status', 'closed');
            break;
          case 'high-priority':
            query = query.in('priority', ['high', 'urgent']);
            break;
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