import React from 'react';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RotateCcw } from 'lucide-react';

interface TicketReopenProps {
  ticketId: string;
  currentStatus: string;
  onTicketReopened?: () => void;
}

const TicketReopen = ({ ticketId, currentStatus, onTicketReopened }: TicketReopenProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const reopenTicketMutation = useMutation({
    mutationFn: async () => {
      // Update ticket status to open and clear closed_at
      const { data, error } = await supabase
        .from('tickets')
        .update({ 
          status: 'open',
          closed_at: null
        })
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;

      // Add a comment about reopening
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          await supabase
            .from('comments')
            .insert({
              ticket_id: ticketId,
              user_id: profile.id,
              content: 'Ticket reaberto para análise adicional.',
              is_private: false
            });
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast({
        title: "Ticket reaberto",
        description: "O ticket foi reaberto com sucesso.",
      });
      onTicketReopened?.();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao reabrir ticket",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  });

  if (currentStatus !== 'closed') {
    return null;
  }

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => reopenTicketMutation.mutate()}
      disabled={reopenTicketMutation.isPending}
    >
      <RotateCcw className="h-4 w-4 mr-2" />
      {reopenTicketMutation.isPending ? 'Reabrindo...' : 'Reabrir Ticket'}
    </Button>
  );
};

export default TicketReopen;