import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, ExternalLink } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const getStatusBadge = (status: string) => {
  const configs = {
    open: { label: "Aberto", variant: "default" as const },
    waiting: { label: "Aguardando", variant: "secondary" as const },
    closed: { label: "Fechado", variant: "outline" as const }
  };
  
  const config = configs[status as keyof typeof configs] || configs.open;
  
  return (
    <Badge variant={config.variant} className="text-xs">
      {config.label}
    </Badge>
  );
};

const getPriorityBadge = (priority: string) => {
  const configs = {
    low: { label: "Baixa", color: "text-green-600 border-green-600" },
    medium: { label: "Média", color: "text-yellow-600 border-yellow-600" },
    high: { label: "Alta", color: "text-orange-600 border-orange-600" },
    critical: { label: "Crítica", color: "text-red-600 border-red-600" }
  };
  
  const config = configs[priority as keyof typeof configs] || configs.medium;
  
  return (
    <Badge variant="outline" className={`text-xs border-2 ${config.color}`}>
      {config.label}
    </Badge>
  );
};

const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m atrás`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}h atrás`;
  } else {
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  }
};

const RecentTickets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch recent tickets based on user role
  const { data: recentTickets, isLoading } = useQuery({
    queryKey: ['recent-tickets', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('user_id', user.id)
        .single();

      if (!profile) return [];

      let query = supabase
        .from('tickets')
        .select(`
          *,
          category:categories(name, color),
          submitter:profiles!tickets_submitter_id_fkey(full_name, email, avatar_url)
        `);

      // Apply role-based filtering
      if (profile.role === 'user') {
        query = query.eq('submitter_id', profile.id);
      } else if (profile.role === 'employee') {
        query = query.or(`submitter_id.eq.${profile.id},assignee_id.eq.${profile.id}`);
      }
      // Admin and owner can see all tickets

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const handleTicketClick = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tickets Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tickets Recentes</CardTitle>
        <Button variant="outline" size="sm" onClick={() => navigate('/tickets')}>
          Ver Todos
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTickets?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum ticket encontrado
            </div>
          ) : (
            recentTickets?.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between space-x-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleTicketClick(ticket.id)}
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={ticket.submitter?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">
                      {ticket.submitter?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{ticket.id.substring(0, 8)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {ticket.category?.name || 'Sem categoria'}
                      </Badge>
                    </div>
                    <p className="font-medium text-sm truncate">
                      {ticket.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        por {ticket.submitter?.full_name || 'Usuário'}
                      </span>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(ticket.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-1">
                  {getStatusBadge(ticket.status)}
                  {getPriorityBadge(ticket.priority)}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTickets;