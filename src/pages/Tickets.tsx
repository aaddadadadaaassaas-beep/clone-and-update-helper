import { useState } from "react";
import Layout from "@/components/Layout/Layout";
import TicketDetails from "@/components/Tickets/TicketDetails";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, 
  Filter, 
  SortAsc, 
  Eye, 
  Edit,
  MoreHorizontal,
  AlertTriangle,
  Clock,
  CheckCircle,
  User,
  Plus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const Tickets = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const mockTickets = [
    {
      id: "1234",
      title: "Problema de login no sistema",
      description: "Usuário não consegue acessar o dashboard",
      status: "open",
      priority: "high",
      submitter: "João Silva",
      assignee: "Maria Santos",
      category: "Acesso",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T14:20:00Z",
      dueDate: "2024-01-16T18:00:00Z"
    },
    {
      id: "1233",
      title: "Erro 500 no módulo de relatórios",
      description: "Sistema retorna erro interno",
      status: "waiting",
      priority: "critical",
      submitter: "Pedro Costa",
      assignee: null,
      category: "Sistema",
      createdAt: "2024-01-15T09:15:00Z",
      updatedAt: "2024-01-15T12:45:00Z",
      dueDate: null
    },
    {
      id: "1232",
      title: "Solicitação de novo usuário",
      description: "Adicionar acesso para funcionário",
      status: "closed",
      priority: "medium",
      submitter: "Ana Oliveira",
      assignee: "Carlos Admin",
      category: "Usuários",
      createdAt: "2024-01-14T16:45:00Z",
      updatedAt: "2024-01-15T09:30:00Z",
      dueDate: null
    },
    {
      id: "1231",
      title: "Lentidão no carregamento",
      description: "Sistema está lento",
      status: "open",
      priority: "low",
      submitter: "Roberto Lima",
      assignee: "Maria Santos",
      category: "Performance",
      createdAt: "2024-01-14T14:20:00Z",
      updatedAt: "2024-01-14T16:10:00Z",
      dueDate: "2024-01-17T12:00:00Z"
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

  const getStatusBadge = (status: string) => {
    const configs = {
      open: { label: "Aberto", className: "bg-orange-100 text-orange-800 border-orange-200" },
      waiting: { label: "Aguardando", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      closed: { label: "Fechado", className: "bg-green-100 text-green-800 border-green-200" },
      duplicate: { label: "Duplicado", className: "bg-gray-100 text-gray-800 border-gray-200" }
    };
    
    const config = configs[status as keyof typeof configs] || configs.open;
    
    return (
      <Badge className={cn("text-xs border", config.className)}>
        {getStatusIcon(status)}
        <span className="ml-1">{config.label}</span>
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
      <Badge variant="outline" className={cn("border-2", config.color)}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTickets = mockTickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.includes(searchTerm) ||
                         ticket.submitter.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleViewTicket = (ticket: any) => {
    setSelectedTicket({ ...ticket, requester: ticket.submitter });
  };

  if (selectedTicket) {
    return (
      <Layout title={`Ticket #${selectedTicket.id}`} subtitle={selectedTicket.title}>
        <Button variant="outline" onClick={() => setSelectedTicket(null)} className="mb-4">
          ← Voltar para Lista
        </Button>
        <TicketDetails
          ticket={selectedTicket}
          onStatusChange={() => {}}
          onAssign={() => {}}
          onAddComment={() => {}}
          onClose={() => {}}
        />
      </Layout>
    );
  }

  return (
    <Layout title="Todos os Tickets" subtitle="Gerenciar e visualizar tickets do sistema">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Gerenciar Tickets</h2>
            <p className="text-sm text-muted-foreground">
              Visualize e gerencie todos os tickets do sistema
            </p>
          </div>
          <Button asChild>
            <a href="/new-ticket">
              <Plus className="h-4 w-4 mr-2" />
              Novo Ticket
            </a>
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Filtros</span>
              <Badge variant="secondary">{filteredTickets.length} tickets</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="open">Abertos</SelectItem>
                  <SelectItem value="waiting">Aguardando</SelectItem>
                  <SelectItem value="closed">Fechados</SelectItem>
                </SelectContent>
              </Select>

              {/* Prioridade */}
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Prioridades</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>

              {/* Ações */}
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Mais Filtros
                </Button>
                <Button variant="outline" size="sm">
                  <SortAsc className="h-4 w-4 mr-2" />
                  Ordenar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Tickets */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">ID</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-24">Prioridade</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="w-16">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      #{ticket.id}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{ticket.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {ticket.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(ticket.status)}
                    </TableCell>
                    <TableCell>
                      {getPriorityBadge(ticket.priority)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {ticket.submitter.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="text-sm">{ticket.submitter}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {ticket.assignee ? (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{ticket.assignee}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Não atribuído</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {ticket.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(ticket.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewTicket(ticket)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Tickets;