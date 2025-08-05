import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database, Trash2, Edit, AlertTriangle } from 'lucide-react';

const BatchOperations = () => {
  const [operation, setOperation] = useState<string>('');
  const [ticketIds, setTicketIds] = useState('');
  const [updateFields, setUpdateFields] = useState<any>({});
  const [preview, setPreview] = useState<any[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const previewMutation = useMutation({
    mutationFn: async () => {
      const ids = ticketIds.split('\n').map(id => id.trim()).filter(Boolean);
      
      if (ids.length === 0) {
        throw new Error('Nenhum ID de ticket fornecido');
      }

      // Fetch tickets for preview
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
          id,
          title,
          status,
          priority,
          submitter:profiles!tickets_submitter_id_fkey(full_name),
          assignee:profiles!tickets_assignee_id_fkey(full_name)
        `)
        .in('id', ids);

      if (error) throw error;

      return tickets || [];
    },
    onSuccess: (data) => {
      setPreview(data);
      toast({
        title: "Prévia gerada",
        description: `${data.length} tickets encontrados para a operação.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na prévia",
        description: error.message || "Erro ao gerar prévia da operação.",
        variant: "destructive",
      });
    }
  });

  const executeMutation = useMutation({
    mutationFn: async () => {
      const ids = ticketIds.split('\n').map(id => id.trim()).filter(Boolean);
      
      switch (operation) {
        case 'delete-tickets':
          // Check if user can delete tickets (only admin/owner)
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');

          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', user.id)
            .single();

          if (!profile || !['admin', 'owner'].includes(profile.role)) {
            throw new Error('Insufficient permissions');
          }

          // Delete comments first (foreign key constraint)
          await supabase.from('comments').delete().in('ticket_id', ids);
          
          // Delete attachments
          await supabase.from('attachments').delete().in('ticket_id', ids);
          
          // Delete ticket history
          await supabase.from('ticket_history').delete().in('ticket_id', ids);
          
          // Delete tickets
          const { error: deleteError } = await supabase
            .from('tickets')
            .delete()
            .in('id', ids);

          if (deleteError) throw deleteError;
          break;

        case 'bulk-update':
          const updates: any = {};
          if (updateFields.status) updates.status = updateFields.status;
          if (updateFields.priority) updates.priority = updateFields.priority;
          if (updateFields.assignee_id) updates.assignee_id = updateFields.assignee_id;

          const { error: updateError } = await supabase
            .from('tickets')
            .update(updates)
            .in('id', ids);

          if (updateError) throw updateError;
          break;

        case 'bulk-close':
          const { error: closeError } = await supabase
            .from('tickets')
            .update({ 
              status: 'closed',
              closed_at: new Date().toISOString()
            })
            .in('id', ids);

          if (closeError) throw closeError;
          break;

        default:
          throw new Error('Operação não suportada');
      }

      return { processedCount: ids.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setTicketIds('');
      setPreview([]);
      setOperation('');
      
      toast({
        title: "Operação concluída",
        description: `${data.processedCount} tickets processados com sucesso.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na operação",
        description: error.message || "Erro ao executar operação em lote.",
        variant: "destructive",
      });
    }
  });

  const getOperationDescription = () => {
    switch (operation) {
      case 'delete-tickets':
        return 'Excluir permanentemente os tickets selecionados';
      case 'bulk-update':
        return 'Atualizar campos dos tickets selecionados';
      case 'bulk-close':
        return 'Fechar todos os tickets selecionados';
      default:
        return 'Selecione uma operação';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Operações em Lote
        </CardTitle>
        <CardDescription>
          Execute operações em múltiplos tickets simultaneamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="operation">Tipo de Operação</Label>
          <Select value={operation} onValueChange={setOperation}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma operação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="delete-tickets">Excluir Tickets</SelectItem>
              <SelectItem value="bulk-update">Atualização em Massa</SelectItem>
              <SelectItem value="bulk-close">Fechar em Lote</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ticket-ids">IDs dos Tickets (um por linha)</Label>
          <Textarea
            id="ticket-ids"
            placeholder="Insira os IDs dos tickets, um por linha"
            value={ticketIds}
            onChange={(e) => setTicketIds(e.target.value)}
            className="min-h-[100px] font-mono text-sm"
          />
        </div>

        {operation === 'bulk-update' && (
          <div className="space-y-4 p-4 border rounded-lg">
            <Label>Campos para Atualizar</Label>
            
            <Select 
              value={updateFields.status || ''} 
              onValueChange={(value) => setUpdateFields({...updateFields, status: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Novo status (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Manter status atual</SelectItem>
                <SelectItem value="open">Aberto</SelectItem>
                <SelectItem value="waiting">Aguardando</SelectItem>
                <SelectItem value="closed">Fechado</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={updateFields.priority || ''} 
              onValueChange={(value) => setUpdateFields({...updateFields, priority: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nova prioridade (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Manter prioridade atual</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => previewMutation.mutate()}
            disabled={!operation || !ticketIds.trim() || previewMutation.isPending}
          >
            <Edit className="h-4 w-4 mr-2" />
            {previewMutation.isPending ? 'Gerando...' : 'Gerar Prévia'}
          </Button>

          {preview.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Executar Operação
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Operação em Lote</AlertDialogTitle>
                  <AlertDialogDescription>
                    {getOperationDescription()}
                    <br />
                    <br />
                    Esta operação afetará {preview.length} tickets e não pode ser desfeita.
                    Tem certeza de que deseja continuar?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => executeMutation.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Confirmar Operação
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {preview.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Prévia da Operação</h4>
              <Badge variant="secondary">{preview.length} tickets</Badge>
            </div>
            
            <div className="border rounded-lg max-h-60 overflow-y-auto">
              {preview.map((ticket) => (
                <div key={ticket.id} className="p-3 border-b last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{ticket.title}</p>
                      <p className="text-xs text-muted-foreground">
                        ID: {ticket.id} • {ticket.submitter?.full_name}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">
                        {ticket.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {ticket.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BatchOperations;