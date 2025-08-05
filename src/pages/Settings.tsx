import Layout from "@/components/Layout/Layout";
import NotificationSettings from "@/components/Settings/NotificationSettings";
import PredefinedResponses from "@/components/Settings/PredefinedResponses";
import ProfileSettings from "@/components/Settings/ProfileSettings";
import AutomationRules from "@/components/Settings/AutomationRules";
import MFASettings from "@/components/Settings/MFASettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Save,
  MessageSquare,
  User,
  Zap
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
    <Layout title="Configurações" subtitle="Gerencie as configurações do sistema">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="responses">Respostas</TabsTrigger>
          <TabsTrigger value="automation">
            <Zap className="h-4 w-4 mr-1" />
            Automação
          </TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <ProfileSettings />
        </TabsContent>
        
        <TabsContent value="general" className="space-y-6">
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

              <div className="flex justify-end">
                <Button onClick={handleSave} className="min-w-32">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings />
        </TabsContent>
        
        <TabsContent value="responses" className="space-y-6">
          <PredefinedResponses />
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <AutomationRules />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <MFASettings />
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Settings;