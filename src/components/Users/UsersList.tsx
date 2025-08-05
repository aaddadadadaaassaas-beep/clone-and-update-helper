import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUsers, useUpdateUserRole, useToggleUserStatus } from '@/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users as UsersIcon, 
  Shield, 
  UserCheck, 
  UserX, 
  Mail,
  Calendar,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const roleConfig = {
  owner: { label: 'Proprietário', color: 'bg-purple-100 text-purple-800', icon: Shield },
  admin: { label: 'Administrador', color: 'bg-blue-100 text-blue-800', icon: Shield },
  employee: { label: 'Funcionário', color: 'bg-green-100 text-green-800', icon: UserCheck },
  user: { label: 'Usuário', color: 'bg-gray-100 text-gray-800', icon: UsersIcon },
};

const UsersList = () => {
  const { data: users, isLoading } = useUsers();
  const updateUserRole = useUpdateUserRole();
  const toggleUserStatus = useToggleUserStatus();
  const { user: currentUser } = useAuth();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: 'owner' | 'admin' | 'employee' | 'user') => {
    try {
      await updateUserRole.mutateAsync({ userId, role: newRole });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleUserStatus.mutateAsync({ userId, isActive: !currentStatus });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-muted rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
          <p className="text-muted-foreground">
            {users?.length || 0} usuários no sistema
          </p>
        </div>
        <Button>
          <UsersIcon className="h-4 w-4 mr-2" />
          Adicionar Usuário
        </Button>
      </div>

      {/* Users List */}
      <div className="grid gap-4">
        {users?.map((user) => {
          const RoleIcon = roleConfig[user.role as keyof typeof roleConfig]?.icon || UsersIcon;
          const isCurrentUser = user.user_id === currentUser?.id;
          
          return (
            <Card key={user.id} className={`transition-shadow ${!user.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {user.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{user.full_name}</h3>
                        {isCurrentUser && (
                          <Badge variant="outline">Você</Badge>
                        )}
                        {!user.is_active && (
                          <Badge variant="destructive">Inativo</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Desde {new Date(user.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        
                        {user.organization && (
                          <div className="flex items-center gap-1">
                            <span>{user.organization}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Role Badge */}
                    <Badge className={roleConfig[user.role as keyof typeof roleConfig]?.color || 'bg-gray-100 text-gray-800'}>
                      <RoleIcon className="h-3 w-3 mr-1" />
                      {roleConfig[user.role as keyof typeof roleConfig]?.label || user.role}
                    </Badge>
                    
                    {/* Role Selector */}
                    {!isCurrentUser && (
                      <Select
                        value={user.role}
                        onValueChange={(newRole: 'owner' | 'admin' | 'employee' | 'user') => handleRoleChange(user.id, newRole)}
                        disabled={updateUserRole.isPending}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Usuário</SelectItem>
                          <SelectItem value="employee">Funcionário</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="owner">Proprietário</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    
                    {/* Actions */}
                    {!isCurrentUser && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusToggle(user.id, user.is_active)}
                            disabled={toggleUserStatus.isPending}
                          >
                            {user.is_active ? (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Ativar
                              </>
                            )}
                          </DropdownMenuItem>
                          {user.role !== 'owner' && user.role !== 'admin' && (
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default UsersList;