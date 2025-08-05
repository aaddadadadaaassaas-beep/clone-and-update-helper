import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Zap, Eye, AlertTriangle, Trash2, Edit, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface BatchOperationsProps {
  className?: string;
}

interface PreviewTicket {
  id: string;
  title: string;
  status: string;
  submitter: { full_name: string };
}

const BatchOperations = ({ className }: BatchOperationsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [operation, setOperation] = useState<string>('');
  const [ticketIds, setTicketIds] = useState<string>('');
  const [updateField, setUpdateField] = useState<string>('');
  const [updateValue, setUpdateValue] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewTicket[]>([]);

  const previewMutation = useMutation({
    mutationFn: async () => {
      if (!ticketIds.trim()) throw new Error('Forneça os IDs dos tickets');

      const ids = ticketIds.split(',').map(id => id.trim()).filter(id => id);
      
      if (ids.length === 0) throw new Error('IDs de tickets inválidos');

      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id,
          title,
          status,
          submitter:profiles!submitter_id(full_name)
        `)
        .in('id', ids);

      if (error) throw error;

      return data || [];
    },
    onSuccess: (data) => {
      setPreviewData(data);
      toast({
        title: 'Prévia gerada',
        description: `${data.length} tickets encontrados.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro na prévia',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });

  const executeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Usuário não autenticado');

      // Verificar permissões
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!profile || !['admin', 'owner'].includes(profile.role)) {
        throw new Error('Acesso negado: apenas administradores podem executar operações em lote');
      }

      const ids = ticketIds.split(',').map(id => id.trim()).filter(id => id);

      switch (operation) {
        case 'delete':
          const { error: deleteError } = await supabase
            .from('tickets')
            .delete()
            .in('id', ids);
          
          if (deleteError) throw deleteError;
          break;

        case 'bulk-update':
          if (!updateField || !updateValue) {
            throw new Error('Campo e valor são obrigatórios para atualização');
          }

          const updateData: any = {};
          updateData[updateField] = updateValue;

          const { error: updateError } = await supabase
            .from('tickets')
            .update(updateData)
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
          throw new Error('Operação não implementada');
      }

      return ids;
    },
    onSuccess: (ids) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast({
        title: 'Operação concluída',
        description: getOperationDescription(operation, ids.length),
      });
      setShowConfirmDialog(false);
      setTicketIds('');
      setUpdateField('');
      setUpdateValue('');
      setPreviewData([]);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro na operação',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });

  const getOperationDescription = (op: string, count: number) => {
    switch (op) {
      case 'delete':
        return `${count} tickets excluídos com sucesso.`;
      case 'bulk-update':
        return `${count} tickets atualizados com sucesso.`;
      case 'bulk-close':
        return `${count} tickets fechados com sucesso.`;
      default:
        return 'Operação concluída.';
    }
  };

  const operations = [
    { value: 'delete', label: 'Excluir Tickets', icon: Trash2, color: 'text-destructive' },
    { value: 'bulk-update', label: 'Atualizar em Massa', icon: Edit, color: 'text-primary' },
    { value: 'bulk-close', label: 'Fechar em Massa', icon: CheckCircle, color: 'text-green-600' },
  ];

  const updateFields = [
    { value: 'priority', label: 'Prioridade' },
    { value: 'status', label: 'Status' },
    { value: 'assignee_id', label: 'Responsável (ID)' },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="h-5 w-5 mr-2" />
          Operações em Lote
        </CardTitle>
        <CardDescription>
          Execute operações em múltiplos tickets simultaneamente
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Tipo de Operação</Label>
          <Select value={operation} onValueChange={setOperation}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a operação" />
            </SelectTrigger>
            <SelectContent>
              {operations.map((op) => {
                const Icon = op.icon;
                return (
                  <SelectItem key={op.value} value={op.value}>
                    <div className="flex items-center">
                      <Icon className={`h-4 w-4 mr-2 ${op.color}`} />
                      {op.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>IDs dos Tickets</Label>
          <Textarea
            placeholder="Digite os IDs dos tickets separados por vírgula
Exemplo: abc123, def456, ghi789"
            value={ticketIds}
            onChange={(e) => setTicketIds(e.target.value)}
            rows={3}
          />
        </div>

        {operation === 'bulk-update' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Campo para Atualizar</Label>
              <Select value={updateField} onValueChange={setUpdateField}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o campo" />
                </SelectTrigger>
                <SelectContent>
                  {updateFields.map((field) => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Novo Valor</Label>
              <Input
                placeholder="Digite o novo valor"
                value={updateValue}
                onChange={(e) => setUpdateValue(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => previewMutation.mutate()}
            disabled={!ticketIds.trim() || previewMutation.isPending}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMutation.isPending ? 'Gerando...' : 'Gerar Prévia'}
          </Button>

          <Button
            onClick={() => setShowConfirmDialog(true)}
            disabled={!operation || !ticketIds.trim() || previewData.length === 0}
            variant={operation === 'delete' ? 'destructive' : 'default'}
          >
            <Zap className="h-4 w-4 mr-2" />
            Executar Operação
          </Button>
        </div>

        {previewData.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label>Prévia dos Tickets Afetados</Label>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {previewData.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div>
                      <span className="font-medium">{ticket.title}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({ticket.submitter?.full_name})
                      </span>
                    </div>
                    <span className="text-sm capitalize">{ticket.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
                Confirmar Operação
              </AlertDialogTitle>
              <AlertDialogDescription>
                Você está prestes a executar uma operação em lote que afetará{' '}
                <strong>{previewData.length} tickets</strong>.
                {operation === 'delete' && (
                  <span className="block mt-2 text-destructive font-medium">
                    ⚠️ Esta ação não pode ser desfeita!
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => executeMutation.mutate()}
                disabled={executeMutation.isPending}
                className={operation === 'delete' ? 'bg-destructive hover:bg-destructive/90' : ''}
              >
                {executeMutation.isPending ? 'Executando...' : 'Confirmar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default BatchOperations;