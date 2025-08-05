import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, User, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TicketHistoryProps {
  ticketId: string;
}

const TicketHistory = ({ ticketId }: TicketHistoryProps) => {
  const { data: history, isLoading } = useQuery({
    queryKey: ['ticket-history', ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ticket_history')
        .select(`
          *,
          user:profiles!ticket_history_user_id_fkey(full_name, email)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!ticketId,
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return '🎫';
      case 'status_changed': return '📊';
      case 'priority_changed': return '⚡';
      case 'assigned': return '👤';
      case 'due_date_changed': return '📅';
      default: return '📝';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-green-100 text-green-800';
      case 'status_changed': return 'bg-blue-100 text-blue-800';
      case 'priority_changed': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'due_date_changed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatValue = (action: string, value: string) => {
    if (action === 'status_changed') {
      switch (value) {
        case 'open': return 'Aberto';
        case 'waiting': return 'Aguardando';
        case 'closed': return 'Fechado';
        default: return value;
      }
    }
    
    if (action === 'priority_changed') {
      switch (value) {
        case 'low': return 'Baixa';
        case 'normal': return 'Normal';
        case 'high': return 'Alta';
        case 'urgent': return 'Urgente';
        default: return value;
      }
    }

    if (action === 'due_date_changed' && value) {
      try {
        return format(new Date(value), 'dd/MM/yyyy HH:mm', { locale: ptBR });
      } catch {
        return value;
      }
    }

    return value;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="h-4 w-4 mr-2" />
            Histórico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-3">
                <div className="h-8 w-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <History className="h-4 w-4 mr-2" />
          Histórico
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history?.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nenhum histórico disponível
          </p>
        ) : (
          <div className="space-y-4">
            {history?.map((item) => (
              <div key={item.id} className="flex space-x-3 pb-4 border-b last:border-0">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm">{getActionIcon(item.action)}</span>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge className={getActionColor(item.action)}>
                        {item.action === 'created' ? 'Criado' :
                         item.action === 'status_changed' ? 'Status' :
                         item.action === 'priority_changed' ? 'Prioridade' :
                         item.action === 'assigned' ? 'Atribuição' :
                         item.action === 'due_date_changed' ? 'Vencimento' : 'Alteração'}
                      </Badge>
                      
                      {item.user && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="h-3 w-3 mr-1" />
                          {item.user.full_name}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm text-foreground">{item.description}</p>
                    
                    {item.old_value && item.new_value && (
                      <div className="mt-2 flex items-center space-x-2 text-xs">
                        <span className="text-muted-foreground">
                          {formatValue(item.action, item.old_value)}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">
                          {formatValue(item.action, item.new_value)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketHistory;