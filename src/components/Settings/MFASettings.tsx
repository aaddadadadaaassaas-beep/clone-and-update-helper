import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Shield, 
  Key, 
  Smartphone, 
  Globe, 
  Users, 
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  CheckCircle,
  QrCode
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MFASettings = () => {
  const { toast } = useToast();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [qrCodeShown, setQrCodeShown] = useState(false);

  const backupCodes = [
    "A1B2-C3D4-E5F6",
    "G7H8-I9J0-K1L2", 
    "M3N4-O5P6-Q7R8",
    "S9T0-U1V2-W3X4",
    "Y5Z6-A7B8-C9D0"
  ];

  const handleEnableMFA = () => {
    if (!mfaEnabled) {
      setQrCodeShown(true);
      toast({
        title: "MFA em configuração",
        description: "Escaneie o QR Code com seu app autenticador.",
      });
    } else {
      setMfaEnabled(false);
      setQrCodeShown(false);
      toast({
        title: "MFA desabilitado",
        description: "Autenticação de dois fatores foi desativada.",
        variant: "destructive",
      });
    }
  };

  const handleVerifyMFA = () => {
    setMfaEnabled(true);
    setQrCodeShown(false);
    toast({
      title: "MFA ativado com sucesso!",
      description: "Sua conta agora está protegida com autenticação de dois fatores.",
    });
  };

  return (
    <div className="space-y-6">
      {/* MFA Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Autenticação de Dois Fatores (MFA)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* MFA Status */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center space-x-3">
              {mfaEnabled ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              )}
              <div>
                <h4 className="font-medium">
                  {mfaEnabled ? "MFA Ativado" : "MFA Desativado"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {mfaEnabled 
                    ? "Sua conta está protegida com autenticação de dois fatores"
                    : "Recomendamos ativar MFA para maior segurança"
                  }
                </p>
              </div>
            </div>
            <Switch
              checked={mfaEnabled}
              onCheckedChange={handleEnableMFA}
            />
          </div>

          {/* QR Code Setup */}
          {qrCodeShown && !mfaEnabled && (
            <div className="p-4 border rounded-lg space-y-4">
              <h4 className="font-medium flex items-center space-x-2">
                <QrCode className="h-4 w-4" />
                <span>Configurar Autenticador</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    1. Baixe um app autenticador (Google Authenticator, Authy, etc.)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    2. Escaneie o QR Code ao lado com o app
                  </p>
                  <p className="text-sm text-muted-foreground">
                    3. Digite o código de 6 dígitos gerado pelo app
                  </p>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mfa-code">Código de Verificação</Label>
                    <Input
                      id="mfa-code"
                      placeholder="000000"
                      maxLength={6}
                      className="text-center text-lg tracking-widest"
                    />
                  </div>
                  
                  <Button onClick={handleVerifyMFA} className="w-full">
                    Verificar e Ativar MFA
                  </Button>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="w-48 h-48 bg-white border-2 border-dashed rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <QrCode className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">QR Code</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Backup Codes */}
          {mfaEnabled && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Códigos de Backup</h4>
                  <p className="text-sm text-muted-foreground">
                    Use estes códigos se perder acesso ao seu dispositivo
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowBackupCodes(!showBackupCodes)}
                >
                  {showBackupCodes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showBackupCodes ? "Ocultar" : "Mostrar"}
                </Button>
              </div>
              
              {showBackupCodes && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="font-mono text-sm p-2 bg-background rounded border">
                        {code}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    ⚠️ Guarde estes códigos em local seguro. Cada código pode ser usado apenas uma vez.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Gerenciamento de Sessões</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-timeout">Timeout de Sessão (minutos)</Label>
            <Select defaultValue="60">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutos</SelectItem>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
                <SelectItem value="120">2 horas</SelectItem>
                <SelectItem value="480">8 horas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Lembrar dispositivo confiável</Label>
              <p className="text-sm text-muted-foreground">
                Não pedir MFA por 30 dias em dispositivos confiáveis
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Forçar logout em outros dispositivos</Label>
              <p className="text-sm text-muted-foreground">
                Encerrar todas as outras sessões ativas
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Logout Forçado
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Política de Senhas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-length">Comprimento mínimo</Label>
              <Input
                id="min-length"
                type="number"
                defaultValue="8"
                min="6"
                max="20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password-expiry">Expiração (dias)</Label>
              <Input
                id="password-expiry"
                type="number"
                defaultValue="90"
                min="30"
                max="365"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Exigir letras maiúsculas</Label>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Exigir números</Label>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Exigir caracteres especiais</Label>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Verificar senhas vazadas</Label>
              <Switch defaultChecked />
            </div>
          </div>

          <div className="flex justify-end">
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Salvar Política
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Login Providers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Provedores de Login</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                <span className="text-white text-sm font-bold">G</span>
              </div>
              <div>
                <Label>Google OAuth</Label>
                <p className="text-sm text-muted-foreground">Login com conta Google</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-sm font-bold">L</span>
              </div>
              <div>
                <Label>LinkedIn OAuth</Label>
                <p className="text-sm text-muted-foreground">Login com conta LinkedIn</p>
              </div>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-white text-sm font-bold">AD</span>
              </div>
              <div>
                <Label>Active Directory</Label>
                <p className="text-sm text-muted-foreground">Integração com AD corporativo</p>
              </div>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MFASettings;