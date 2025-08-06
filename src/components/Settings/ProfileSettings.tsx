import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const ProfileSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    organization: '',
    avatar_url: ''
  });

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        organization: profile.organization || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user) throw new Error('No user found');

      console.log('Updating profile with data:', data);
      console.log('User role:', profile?.role);

      // Create the update data object - only include changed fields
      const updateData: any = {};
      
      if (data.full_name !== profile?.full_name) updateData.full_name = data.full_name;
      if (data.email !== profile?.email) updateData.email = data.email;
      if (data.organization !== profile?.organization) updateData.organization = data.organization;
      if (data.avatar_url !== profile?.avatar_url) updateData.avatar_url = data.avatar_url;

      console.log('Update data (only changed fields):', updateData);

      // If nothing changed, don't make the call
      if (Object.keys(updateData).length === 0) {
        console.log('No changes detected, skipping update');
        throw new Error('NO_CHANGES');
      }

      const { data: result, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Update error:', error);
        console.error('Error details:', error.details, error.hint, error.message);
        throw error;
      }

      if (!result) {
        throw new Error('Nenhum perfil foi atualizado. Verifique suas permissões.');
      }

      console.log('Update result:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Profile updated successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile-header'] });
      setIsEditing(false);
      
      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram atualizadas com sucesso.',
      });
    },
    onError: (error: any) => {
      console.error('Profile update error:', error);
      
      if (error.message === 'NO_CHANGES') {
        setIsEditing(false);
        toast({
          title: 'Nenhuma alteração',
          description: 'Não foram detectadas mudanças para salvar.',
          variant: 'default',
        });
        return;
      }
      
      toast({
        title: 'Erro ao atualizar perfil',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update form data
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));

      toast({
        title: 'Avatar carregado',
        description: 'Sua foto foi carregada com sucesso. Clique em "Salvar" para confirmar.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro no upload',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Informações do Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Perfil</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={formData.avatar_url} />
              <AvatarFallback className="text-lg">
                {formData.full_name ? formData.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'AS'}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <div>
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span>
                      <Camera className="h-4 w-4 mr-2" />
                      Alterar Foto
                    </span>
                  </Button>
                </Label>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                disabled={!isEditing}
                className={isEditing ? "border-primary/50" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing}
                className={isEditing ? "border-primary/50" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organização</Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                disabled={!isEditing}
                placeholder="Opcional"
                className={isEditing ? "border-primary/50" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label>Perfil</Label>
              <Input
                value={profile?.role === 'admin' ? 'Administrador' :
                       profile?.role === 'owner' ? 'Proprietário' :
                       profile?.role === 'employee' ? 'Funcionário' : 'Usuário'}
                disabled
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-4">
            {!isEditing ? (
              <div className="flex justify-start">
                <Button 
                  type="button" 
                  onClick={() => {
                    console.log('Entering edit mode...');
                    setIsEditing(true);
                  }}
                  className="w-auto"
                >
                  Editar Perfil
                </Button>
              </div>
            ) : (
              <>
                <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Modo de edição ativo
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Faça suas alterações e clique em "Salvar Alterações" para confirmar.
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <Button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('Save button clicked!');
                      console.log('Current form data:', formData);
                      console.log('Original profile:', profile);
                      handleSubmit(e);
                    }}
                    disabled={updateProfile.isPending}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateProfile.isPending ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      console.log('Canceling edit...');
                      setIsEditing(false);
                      if (profile) {
                        setFormData({
                          full_name: profile.full_name || '',
                          email: profile.email || '',
                          organization: profile.organization || '',
                          avatar_url: profile.avatar_url || ''
                        });
                      }
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;