import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, ExternalLink } from "lucide-react";

const mockRecentTickets = [
  {
    id: "1234",
    title: "Problema de login no sistema",
    status: "open",
    priority: "high",
    submitter: "João Silva",
    createdAt: "2024-01-15T10:30:00Z",
    category: "Acesso"
  },
  {
    id: "1233",
    title: "Erro 500 no módulo de relatórios",
    status: "waiting",
    priority: "critical",
    submitter: "Pedro Costa",
    createdAt: "2024-01-15T09:15:00Z",
    category: "Sistema"
  },
  {
    id: "1232",
    title: "Solicitação de novo usuário",
    status: "closed",
    priority: "medium",
    submitter: "Ana Oliveira",
    createdAt: "2024-01-14T16:45:00Z",
    category: "Usuários"
  },
  {
    id: "1231",
    title: "Lentidão no carregamento",
    status: "open",
    priority: "low",
    submitter: "Roberto Lima",
    createdAt: "2024-01-14T14:20:00Z",
    category: "Performance"
  }
];

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
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tickets Recentes</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <a href="/tickets">
            Ver Todos
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockRecentTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-center justify-between space-x-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-xs">
                    {ticket.submitter.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{ticket.id}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {ticket.category}
                    </Badge>
                  </div>
                  <p className="font-medium text-sm truncate">
                    {ticket.title}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      por {ticket.submitter}
                    </span>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimeAgo(ticket.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-1">
                {getStatusBadge(ticket.status)}
                {getPriorityBadge(ticket.priority)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTickets;