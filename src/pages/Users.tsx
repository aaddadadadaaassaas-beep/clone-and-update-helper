import { useState } from "react";
import Layout from "@/components/Layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Edit, Trash2, UserCheck, Shield, Crown } from "lucide-react";

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const mockUsers = [
    {
      id: "1",
      name: "Admin User",
      email: "admin@helpdesk.com",
      role: "owner",
      status: "active",
      organization: "TI",
      lastLogin: "2024-01-15T14:30:00Z",
      ticketsAssigned: 12,
      ticketsResolved: 45
    },
    {
      id: "2", 
      name: "Maria Santos",
      email: "maria@helpdesk.com",
      role: "admin",
      status: "active",
      organization: "Suporte",
      lastLogin: "2024-01-15T13:15:00Z",
      ticketsAssigned: 8,
      ticketsResolved: 32
    },
    {
      id: "3",
      name: "João Silva",
      email: "joao@empresa.com",
      role: "employee",
      status: "active", 
      organization: "Vendas",
      lastLogin: "2024-01-15T09:45:00Z",
      ticketsAssigned: 0,
      ticketsResolved: 0
    },
    {
      id: "4",
      name: "Pedro Costa",
      email: "pedro@empresa.com",
      role: "employee",
      status: "inactive",
      organization: "Marketing",
      lastLogin: "2024-01-10T16:20:00Z",
      ticketsAssigned: 0,
      ticketsResolved: 0
    }
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case "admin":
        return <Shield className="h-4 w-4 text-blue-600" />;
      case "employee":
        return <UserCheck className="h-4 w-4 text-green-600" />;
      default:
        return <UserCheck className="h-4 w-4" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const configs = {
      owner: { label: "Owner", variant: "default" as const },
      admin: { label: "Administrador", variant: "secondary" as const },
      employee: { label: "Funcionário", variant: "outline" as const }
    };
    
    const config = configs[role as keyof typeof configs] || configs.employee;
    
    return (
      <Badge variant={config.variant} className="text-xs">
        {getRoleIcon(role)}
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge 
        variant={status === "active" ? "default" : "outline"}
        className={`text-xs ${
          status === "active" 
            ? "bg-green-100 text-green-800 border-green-200" 
            : "bg-red-100 text-red-800 border-red-200"
        }`}
      >
        {status === "active" ? "Ativo" : "Inativo"}
      </Badge>
    );
  };

  const formatLastLogin = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="Usuários" subtitle="Gerenciar usuários do sistema">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Gerenciar Usuários</h2>
            <p className="text-sm text-muted-foreground">
              Visualize e gerencie todos os usuários do sistema
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Filtros</span>
              <Badge variant="secondary">{filteredUsers.length} usuários</Badge>
            </CardTitle>
            <CardDescription>
              Busque por nome, email ou organização
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Usuários */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Organização</TableHead>
                  <TableHead>Último Login</TableHead>
                  <TableHead>Tickets</TableHead>
                  <TableHead className="w-16">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback className="text-xs">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(user.role)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user.status)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {user.organization}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatLastLogin(user.lastLogin)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{user.ticketsAssigned} atribuídos</p>
                        <p className="text-muted-foreground">{user.ticketsResolved} resolvidos</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          {user.role !== "owner" && (
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          )}
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

export default Users;