import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bell, Mail, Settings, Users, Plus, Edit, Trash2 } from 'lucide-react';

const NotificationSettings = () => {
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [newSetting, setNewSetting] = useState({
    event_type: '',
    recipients: [],
    email_template: '',
    is_enabled: true
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Available events and recipients
  const eventTypes = [
    { value: 'ticket_created', label: 'Abertura de Ticket' },
    { value: 'ticket_assigned', label: 'Atribuição de Ticket' },
    { value: 'ticket_updated', label: 'Atualização de Ticket' },
    { value: 'ticket_closed', label: 'Fechamento de Ticket' },
    { value: 'comment_added', label: 'Novo Comentário' },
    { value: 'ticket_reopened', label: 'Reabertura de Ticket' },
    { value: 'ticket_duplicated', label: 'Ticket Duplicado' }
  ];

  const recipientTypes = [
    { value: 'submitter', label: 'Solicitante' },
    { value: 'assignee', label: 'Responsável' },
    { value: 'all_admins', label: 'Todos os Administradores' },
    { value: 'all_employees', label: 'Todos os Funcionários' },
    { value: 'cc_users', label: 'Usuários em CC' }
  ];

  // Fetch notification settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  // Create/Update notification setting
  const saveMutation = useMutation({
    mutationFn: async (setting: any) => {
      const { data, error } = await supabase
        .from('notification_settings')
        .upsert(setting)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      setNewSetting({
        event_type: '',
        recipients: [],
        email_template: '',
        is_enabled: true
      });
      toast({
        title: "Configuração salva",
        description: "As configurações de notificação foram atualizadas.",
      });
    }
  });

  // Delete notification setting
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notification_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      toast({
        title: "Configuração removida",
        description: "A configuração de notificação foi removida.",
      });
    }
  });

  // Toggle notification setting
  const toggleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('notification_settings')
        .update({ is_enabled: enabled })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
    }
  });

  const handleSave = () => {
    if (!newSetting.event_type) {
      toast({
        title: "Evento necessário",
        description: "Selecione um tipo de evento.",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate(newSetting);
  };

  const getEventLabel = (eventType: string) => {
    return eventTypes.find(e => e.value === eventType)?.label || eventType;
  };

  const getRecipientLabels = (recipients: string[]) => {
    return recipients.map(r => 
      recipientTypes.find(rt => rt.value === r)?.label || r
    ).join(', ');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Configurações de Notificação
          </CardTitle>
          <CardDescription>
            Configure quando e para quem enviar notificações automáticas por email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="settings">Configurações Ativas</TabsTrigger>
              <TabsTrigger value="new">Nova Configuração</TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-4">
                {settings?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma configuração de notificação encontrada.</p>
                    <p>Crie uma nova configuração na aba "Nova Configuração".</p>
                  </div>
                ) : (
                  settings?.map((setting) => (
                    <Card key={setting.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {getEventLabel(setting.event_type)}
                            </Badge>
                            {setting.is_enabled ? (
                              <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                            ) : (
                              <Badge variant="secondary">Inativo</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <strong>Para:</strong> {getRecipientLabels(setting.recipients || [])}
                          </p>
                          {setting.email_template && (
                            <p className="text-sm text-muted-foreground">
                              <strong>Template:</strong> {setting.email_template}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={setting.is_enabled}
                            onCheckedChange={(checked) => 
                              toggleMutation.mutate({ id: setting.id, enabled: checked })
                            }
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate(setting.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="new" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-type">Tipo de Evento</Label>
                  <Select
                    value={newSetting.event_type}
                    onValueChange={(value) => setNewSetting({...newSetting, event_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um evento" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((event) => (
                        <SelectItem key={event.value} value={event.value}>
                          {event.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipients">Destinatários</Label>
                  <Select
                    value={newSetting.recipients[0] || ''}
                    onValueChange={(value) => setNewSetting({...newSetting, recipients: [value]})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione destinatários" />
                    </SelectTrigger>
                    <SelectContent>
                      {recipientTypes.map((recipient) => (
                        <SelectItem key={recipient.value} value={recipient.value}>
                          {recipient.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email-template">Template de Email (opcional)</Label>
                  <Input
                    id="email-template"
                    placeholder="Nome do template personalizado"
                    value={newSetting.email_template}
                    onChange={(e) => setNewSetting({...newSetting, email_template: e.target.value})}
                  />
                </div>

                <div className="flex items-center space-x-2 md:col-span-2">
                  <Switch
                    id="is-enabled"
                    checked={newSetting.is_enabled}
                    onCheckedChange={(checked) => setNewSetting({...newSetting, is_enabled: checked})}
                  />
                  <Label htmlFor="is-enabled">Ativar notificação</Label>
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {saveMutation.isPending ? 'Salvando...' : 'Criar Configuração'}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;