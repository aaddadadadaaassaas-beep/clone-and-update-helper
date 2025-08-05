import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  User,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "open" | "waiting" | "closed" | "duplicate";
  priority: "low" | "medium" | "high" | "critical";
  submitter: {
    name: string;
    email: string;
    avatar?: string;
  };
  assignee?: {
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
  category: string;
}

interface RecentTicketsProps {
  tickets?: Ticket[];
  className?: string;
}

const RecentTickets = ({ tickets, className }: RecentTicketsProps) => {
  const mockTickets: Ticket[] = tickets || [
    {
      id: "1234",
      title: "Problema de login no sistema",
      description: "Usuário não consegue acessar o dashboard após a atualização",
      status: "open",
      priority: "high",
      submitter: {
        name: "João Silva",
        email: "joao@empresa.com"
      },
      assignee: {
        name: "Maria Santos",
        email: "maria@helpdesk.com"
      },
      createdAt: "2024-01-15T10:30:00Z",
      category: "Acesso"
    },
    {
      id: "1233",
      title: "Erro 500 no módulo de relatórios",
      description: "Sistema retorna erro interno ao gerar relatórios mensais",
      status: "waiting",
      priority: "critical",
      submitter: {
        name: "Pedro Costa",
        email: "pedro@empresa.com"
      },
      createdAt: "2024-01-15T09:15:00Z",
      category: "Sistema"
    },
    {
      id: "1232",
      title: "Solicitação de novo usuário",
      description: "Adicionar acesso para novo funcionário do departamento financeiro",
      status: "closed",
      priority: "medium",
      submitter: {
        name: "Ana Oliveira",
        email: "ana@empresa.com"
      },
      assignee: {
        name: "Carlos Admin",
        email: "carlos@helpdesk.com"
      },
      createdAt: "2024-01-14T16:45:00Z",
      category: "Usuários"
    },
    {
      id: "1231",
      title: "Lentidão no carregamento de páginas",
      description: "Sistema está lento, principalmente nas páginas de listagem",
      status: "open",
      priority: "low",
      submitter: {
        name: "Roberto Lima",
        email: "roberto@empresa.com"
      },
      createdAt: "2024-01-14T14:20:00Z",
      category: "Performance"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertTriangle className="h-4 w-4" />;
      case "waiting":
        return <Clock className="h-4 w-4" />;
      case "closed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "status-open";
      case "waiting":
        return "status-waiting";
      case "closed":
        return "status-closed";
      case "duplicate":
        return "status-duplicate";
      default:
        return "status-open";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "priority-low";
      case "medium":
        return "priority-medium";
      case "high":
        return "priority-high";
      case "critical":
        return "priority-critical";
      default:
        return "priority-medium";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Há poucos minutos";
    } else if (diffInHours < 24) {
      return `Há ${diffInHours} horas`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Há ${diffInDays} dias`;
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tickets Recentes</CardTitle>
          <CardDescription>
            Últimos tickets criados e atualizados no sistema
          </CardDescription>
        </div>
        <Button variant="outline" size="sm">
          Ver Todos
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockTickets.map((ticket) => (
            <div 
              key={ticket.id}
              className="flex items-start space-x-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-smooth cursor-pointer"
            >
              <div className="flex-shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {ticket.submitter.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground truncate">
                      #{ticket.id} - {ticket.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {ticket.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Badge className={cn("text-xs", getStatusColor(ticket.status))}>
                      {getStatusIcon(ticket.status)}
                      <span className="ml-1 capitalize">{ticket.status}</span>
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-4">
                    <span className="text-muted-foreground">
                      {ticket.submitter.name}
                    </span>
                    {ticket.assignee && (
                      <>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-muted-foreground">
                          <User className="inline h-3 w-3 mr-1" />
                          {ticket.assignee.name}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className={cn("border-2", getPriorityColor(ticket.priority))}
                    >
                      {ticket.priority.toUpperCase()}
                    </Badge>
                    <span className="text-muted-foreground">
                      {formatDate(ticket.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTickets;