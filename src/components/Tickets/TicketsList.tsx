import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTickets } from '@/hooks/useTickets';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  User,
  MoreVertical,
  Edit,
  MessageSquare
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

const statusConfig = {
  open: { label: 'Aberto', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
  waiting: { label: 'Aguardando', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  closed: { label: 'Fechado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
};

const priorityConfig = {
  low: { label: 'Baixa', color: 'bg-blue-100 text-blue-800' },
  normal: { label: 'Normal', color: 'bg-gray-100 text-gray-800' },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Urgente', color: 'bg-red-100 text-red-800' },
};

interface TicketsListProps {
  view?: 'all' | 'my-tickets' | 'waiting' | 'closed' | 'high-priority';
}

const TicketsList = ({ view = 'all' }: TicketsListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const { data: tickets, isLoading } = useTickets();
  const { user } = useAuth();
  const navigate = useNavigate();

  const filteredTickets = tickets?.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    // Apply view filters
    switch (view) {
      case 'my-tickets':
        return matchesSearch && matchesStatus && matchesPriority && 
               (ticket.submitter?.user_id === user?.id || ticket.assignee?.user_id === user?.id);
      case 'waiting':
        return matchesSearch && matchesPriority && ticket.status === 'waiting';
      case 'closed':
        return matchesSearch && matchesPriority && ticket.status === 'closed';
      case 'high-priority':
        return matchesSearch && matchesStatus && (ticket.priority === 'high' || ticket.priority === 'urgent');
      default:
        return matchesSearch && matchesStatus && matchesPriority;
    }
  });

  const getViewTitle = () => {
    switch (view) {
      case 'my-tickets': return 'Meus Tickets';
      case 'waiting': return 'Tickets Aguardando';
      case 'closed': return 'Tickets Fechados';
      case 'high-priority': return 'Tickets Prioritários';
      default: return 'Todos os Tickets';
    }
  };

  const handleViewTicket = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{getViewTitle()}</h2>
          <p className="text-muted-foreground">
            {filteredTickets?.length || 0} tickets encontrados
          </p>
        </div>
        <Button onClick={() => navigate('/new-ticket')}>
          Novo Ticket
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {view === 'all' && (
              <>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="open">Aberto</SelectItem>
                    <SelectItem value="waiting">Aguardando</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Prioridades</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets?.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Nenhum ticket encontrado</h3>
                <p>Tente ajustar os filtros ou criar um novo ticket.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredTickets?.map((ticket) => {
            const StatusIcon = statusConfig[ticket.status].icon;
            return (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 
                          className="font-semibold text-lg hover:text-primary"
                          onClick={() => handleViewTicket(ticket.id)}
                        >
                          {ticket.title}
                        </h3>
                        <Badge className={statusConfig[ticket.status].color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[ticket.status].label}
                        </Badge>
                        <Badge variant="outline" className={priorityConfig[ticket.priority].color}>
                          {priorityConfig[ticket.priority].label}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground line-clamp-2">
                        {ticket.description}
                      </p>
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>Por: {ticket.submitter?.full_name || 'Usuário'}</span>
                        </div>
                        
                        {ticket.assignee && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>Atribuído: {ticket.assignee.full_name}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(ticket.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>#{ticket.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewTicket(ticket.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/tickets/${ticket.id}/edit`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TicketsList;