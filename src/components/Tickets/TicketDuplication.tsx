import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Copy } from 'lucide-react';

interface TicketDuplicationProps {
  originalTicketId: string;
  onTicketCreated?: () => void;
}

const TicketDuplication = ({ originalTicketId, onTicketCreated }: TicketDuplicationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [duplicateTicketId, setDuplicateTicketId] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const duplicateTicketMutation = useMutation({
    mutationFn: async () => {
      // Get the original ticket
      const { data: originalTicket, error: fetchError } = await supabase
        .from('tickets')
        .select(`
          title,
          description,
          category_id,
          priority,
          submitter_id
        `)
        .eq('id', originalTicketId)
        .single();

      if (fetchError) throw fetchError;

      // Update the original ticket status to closed with duplicate reference
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ 
          status: 'closed',
          closed_at: new Date().toISOString()
        })
        .eq('id', originalTicketId);

      if (updateError) throw updateError;

      // Insert a comment on the original ticket
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
              ticket_id: originalTicketId,
              user_id: profile.id,
              content: `Ticket marcado como duplicado. Ticket relacionado: ${duplicateTicketId}`,
              is_private: false
            });
        }
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', originalTicketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast({
        title: "Ticket marcado como duplicado",
        description: "O ticket foi fechado e marcado como duplicado.",
      });
      setIsOpen(false);
      setDuplicateTicketId('');
      onTicketCreated?.();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao marcar como duplicado",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  });

  const handleDuplicate = () => {
    if (!duplicateTicketId.trim()) {
      toast({
        title: "ID do ticket necessário",
        description: "Por favor, insira o ID do ticket original.",
        variant: "destructive",
      });
      return;
    }
    duplicateTicketMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Copy className="h-4 w-4 mr-2" />
          Marcar como Duplicado
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Marcar como Duplicado</DialogTitle>
          <DialogDescription>
            Este ticket será fechado e marcado como duplicado. Insira o ID do ticket original.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duplicate-id" className="text-right">
              Ticket Original
            </Label>
            <Input
              id="duplicate-id"
              placeholder="ID do ticket original"
              value={duplicateTicketId}
              onChange={(e) => setDuplicateTicketId(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleDuplicate}
            disabled={duplicateTicketMutation.isPending}
          >
            {duplicateTicketMutation.isPending ? 'Processando...' : 'Marcar como Duplicado'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDuplication;