import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUsers, useUpdateUserRole, useToggleUserStatus, useDeleteUser, useEditUser } from '@/hooks/useUsers';
import { useChangeUserPassword } from '@/hooks/usePasswordManagement';
import { useAuth } from '@/contexts/AuthContext';
import AddUserDialog from './AddUserDialog';
import { 
  Users as UsersIcon, 
  Shield, 
  UserCheck, 
  UserX, 
  Mail,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const deleteUser = useDeleteUser();
  const editUser = useEditUser();
  const changePassword = useChangeUserPassword();
  const { user: currentUser } = useAuth();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<any>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    email: '',
    organization: ''
  });
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);

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

  const handlePasswordChange = async () => {
    if (!selectedUserForPassword || !newPassword) return;
    
    try {
      await changePassword.mutateAsync({ 
        userId: selectedUserForPassword.id, // Use profile id instead of user_id
        newPassword 
      });
      setShowPasswordDialog(false);
      setNewPassword('');
      setSelectedUserForPassword(null);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const openPasswordDialog = (user: any) => {
    setSelectedUserForPassword(user);
    setShowPasswordDialog(true);
  };

  const openEditDialog = (user: any) => {
    setSelectedUserForEdit(user);
    setEditFormData({
      full_name: user.full_name || '',
      email: user.email || '',
      organization: user.organization || ''
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (user: any) => {
    setSelectedUserForDelete(user);
    setShowDeleteDialog(true);
  };

  const handleEdit = async () => {
    if (!selectedUserForEdit) return;
    
    try {
      await editUser.mutateAsync({
        userId: selectedUserForEdit.id,
        userData: editFormData
      });
      setShowEditDialog(false);
      setSelectedUserForEdit(null);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleDelete = async () => {
    if (!selectedUserForDelete) return;
    
    try {
      await deleteUser.mutateAsync(selectedUserForDelete.user_id);
      setShowDeleteDialog(false);
      setSelectedUserForDelete(null);
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
        <Button onClick={() => setShowAddUserDialog(true)}>
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
                          <DropdownMenuItem onClick={() => openEditDialog(user)}>
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
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => openDeleteDialog(user)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => openPasswordDialog(user)}
                          >
                            <Key className="h-4 w-4 mr-2" />
                            Alterar Senha
                          </DropdownMenuItem>
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

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Senha do Usuário</DialogTitle>
            <DialogDescription>
              Alterando senha para: {selectedUserForPassword?.full_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handlePasswordChange}
              disabled={!newPassword || changePassword.isPending}
            >
              {changePassword.isPending ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Editando informações de: {selectedUserForEdit?.full_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editFullName">Nome Completo</Label>
              <Input
                id="editFullName"
                value={editFormData.full_name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editOrganization">Organização</Label>
              <Input
                id="editOrganization"
                value={editFormData.organization}
                onChange={(e) => setEditFormData(prev => ({ ...prev, organization: e.target.value }))}
                placeholder="Organização (opcional)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEdit}
              disabled={!editFormData.full_name || !editFormData.email || editUser.isPending}
            >
              {editUser.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o usuário <strong>{selectedUserForDelete?.full_name}</strong>?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteUser.isPending}
            >
              {deleteUser.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <AddUserDialog 
        open={showAddUserDialog} 
        onOpenChange={setShowAddUserDialog}
      />
    </div>
  );
};

export default UsersList;