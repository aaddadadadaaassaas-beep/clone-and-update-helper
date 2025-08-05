import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText } from 'lucide-react';
import { format } from 'date-fns';

const JsonExport = () => {
  const [exportType, setExportType] = useState('all');
  const [includeComments, setIncludeComments] = useState(true);
  const [includeAttachments, setIncludeAttachments] = useState(true);
  const [includeHistory, setIncludeHistory] = useState(true);
  const [includePrivateComments, setIncludePrivateComments] = useState(false);
  const { toast } = useToast();

  const exportMutation = useMutation({
    mutationFn: async () => {
      // Build query based on export type
      let ticketsQuery = supabase
        .from('tickets')
        .select(`
          *,
          category:categories(*),
          submitter:profiles!tickets_submitter_id_fkey(full_name, email, user_id),
          assignee:profiles!tickets_assignee_id_fkey(full_name, email, user_id)
        `);

      // Apply filters based on export type
      switch (exportType) {
        case 'open':
          ticketsQuery = ticketsQuery.eq('status', 'open');
          break;
        case 'closed':
          ticketsQuery = ticketsQuery.eq('status', 'closed');
          break;
        case 'waiting':
          ticketsQuery = ticketsQuery.eq('status', 'waiting');
          break;
        case 'high-priority':
          ticketsQuery = ticketsQuery.in('priority', ['high', 'urgent']);
          break;
      }

      const { data: tickets, error: ticketsError } = await ticketsQuery.order('created_at', { ascending: false });
      
      if (ticketsError) throw ticketsError;

      const exportData: any = {
        metadata: {
          exportedAt: new Date().toISOString(),
          exportType,
          totalTickets: tickets?.length || 0,
          includeComments,
          includeAttachments,
          includeHistory,
          includePrivateComments
        },
        tickets: []
      };

      // Process each ticket
      for (const ticket of tickets || []) {
        const ticketData: any = {
          ...ticket,
          comments: [],
          attachments: [],
          history: []
        };

        // Get comments if requested
        if (includeComments) {
          let commentsQuery = supabase
            .from('comments')
            .select(`
              *,
              user:profiles!comments_user_id_fkey(full_name, email)
            `)
            .eq('ticket_id', ticket.id);

          if (!includePrivateComments) {
            commentsQuery = commentsQuery.eq('is_private', false);
          }

          const { data: comments } = await commentsQuery.order('created_at', { ascending: true });
          ticketData.comments = comments || [];
        }

        // Get attachments if requested
        if (includeAttachments) {
          const { data: attachments } = await supabase
            .from('attachments')
            .select('*')
            .eq('ticket_id', ticket.id)
            .order('created_at', { ascending: true });
          
          ticketData.attachments = attachments || [];
        }

        // Get history if requested
        if (includeHistory) {
          const { data: history } = await supabase
            .from('ticket_history')
            .select(`
              *,
              user:profiles!ticket_history_user_id_fkey(full_name, email)
            `)
            .eq('ticket_id', ticket.id)
            .order('created_at', { ascending: true });
          
          ticketData.history = history || [];
        }

        exportData.tickets.push(ticketData);
      }

      return exportData;
    },
    onSuccess: (data) => {
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `helpdesk-export-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Exportação concluída",
        description: `${data.tickets.length} tickets foram exportados com sucesso.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na exportação",
        description: error.message || "Ocorreu um erro durante a exportação.",
        variant: "destructive",
      });
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Exportar Tickets (JSON)
        </CardTitle>
        <CardDescription>
          Exporte dados de tickets em formato JSON para análise ou backup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="export-type">Tipo de Exportação</Label>
          <Select value={exportType} onValueChange={setExportType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tickets</SelectItem>
              <SelectItem value="open">Tickets Abertos</SelectItem>
              <SelectItem value="waiting">Tickets Aguardando</SelectItem>
              <SelectItem value="closed">Tickets Fechados</SelectItem>
              <SelectItem value="high-priority">Alta Prioridade</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label>Dados para Incluir</Label>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="include-comments" 
              checked={includeComments}
              onCheckedChange={(checked) => setIncludeComments(checked === true)}
            />
            <Label htmlFor="include-comments">Comentários públicos</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="include-private-comments" 
              checked={includePrivateComments}
              onCheckedChange={(checked) => setIncludePrivateComments(checked === true)}
              disabled={!includeComments}
            />
            <Label htmlFor="include-private-comments">Comentários privados (staff)</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="include-attachments" 
              checked={includeAttachments}
              onCheckedChange={(checked) => setIncludeAttachments(checked === true)}
            />
            <Label htmlFor="include-attachments">Referências de anexos</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="include-history" 
              checked={includeHistory}
              onCheckedChange={(checked) => setIncludeHistory(checked === true)}
            />
            <Label htmlFor="include-history">Histórico de alterações</Label>
          </div>
        </div>

        <Button 
          onClick={() => exportMutation.mutate()}
          disabled={exportMutation.isPending}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          {exportMutation.isPending ? 'Exportando...' : 'Exportar JSON'}
        </Button>

        {exportMutation.isPending && (
          <div className="text-sm text-muted-foreground">
            <p>⚠️ Para grandes volumes de dados, a exportação pode levar alguns minutos.</p>
            <p>O arquivo será baixado automaticamente quando concluído.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JsonExport;