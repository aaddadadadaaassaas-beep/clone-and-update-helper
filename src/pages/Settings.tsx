import Layout from "@/components/Layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Users, 
  Shield, 
  Mail,
  Palette,
  Globe,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Configurações salvas",
      description: "Suas alterações foram salvas com sucesso.",
    });
  };

  return (
    <Layout title="Configurações" subtitle="Gerenciar configurações do sistema">
      <div className="space-y-6">
        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SettingsIcon className="h-5 w-5" />
              <span>Configurações Gerais</span>
            </CardTitle>
            <CardDescription>
              Configurações básicas do sistema de helpdesk
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Nome da Empresa</Label>
                <Input id="company-name" defaultValue="HelpDesk System" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">Email de Suporte</Label>
                <Input id="support-email" type="email" defaultValue="support@helpdesk.com" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="welcome-message">Mensagem de Boas-vindas</Label>
              <Textarea 
                id="welcome-message" 
                placeholder="Digite a mensagem que será exibida no portal..."
                defaultValue="Bem-vindo ao nosso sistema de suporte. Estamos aqui para ajudar você!"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Select defaultValue="america/sao_paulo">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="america/sao_paulo">América/São Paulo (UTC-3)</SelectItem>
                  <SelectItem value="america/new_york">América/Nova York (UTC-5)</SelectItem>
                  <SelectItem value="europe/london">Europa/Londres (UTC+0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Notificação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notificações</span>
            </CardTitle>
            <CardDescription>
              Configure quando e como as notificações são enviadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificar criação de tickets</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar email quando um novo ticket for criado
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificar atribuição de tickets</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar email quando um ticket for atribuído
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificar fechamento de tickets</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar email quando um ticket for fechado
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="notification-sender">Nome do Remetente</Label>
              <Input 
                id="notification-sender" 
                defaultValue="Help Desk - HelpDesk System" 
                placeholder="Nome que aparecerá como remetente"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Usuários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Usuários e Permissões</span>
            </CardTitle>
            <CardDescription>
              Configurações relacionadas a usuários e acesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Permitir auto-registro</Label>
                <p className="text-sm text-muted-foreground">
                  Usuários podem criar contas automaticamente
                </p>
              </div>
              <Switch />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Exigir aprovação para novos usuários</Label>
                <p className="text-sm text-muted-foreground">
                  Administradores devem aprovar novos usuários
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="max-users">Limite máximo de usuários</Label>
              <Input 
                id="max-users" 
                type="number" 
                defaultValue="725" 
                min="1"
                max="1000"
              />
              <p className="text-sm text-muted-foreground">
                Número máximo de usuários permitidos no sistema
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Segurança</span>
            </CardTitle>
            <CardDescription>
              Configurações de segurança e autenticação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Exigir autenticação multifator (MFA)</Label>
                <p className="text-sm text-muted-foreground">
                  Obrigar MFA para todos os usuários
                </p>
              </div>
              <Switch />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Permitir login com Google/LinkedIn</Label>
                <p className="text-sm text-muted-foreground">
                  Habilitar autenticação OAuth
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="session-timeout">Timeout de sessão (minutos)</Label>
              <Input 
                id="session-timeout" 
                type="number" 
                defaultValue="60" 
                min="5"
                max="480"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Configurações de Email</span>
            </CardTitle>
            <CardDescription>
              Configure o servidor SMTP para envio de emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-server">Servidor SMTP</Label>
                <Input id="smtp-server" placeholder="smtp.gmail.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-port">Porta</Label>
                <Input id="smtp-port" type="number" defaultValue="587" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-username">Usuário</Label>
                <Input id="smtp-username" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-password">Senha</Label>
                <Input id="smtp-password" type="password" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Usar TLS/SSL</Label>
                <p className="text-sm text-muted-foreground">
                  Conexão segura com o servidor SMTP
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="min-w-32">
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;