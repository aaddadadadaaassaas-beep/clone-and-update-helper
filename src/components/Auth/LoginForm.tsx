import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Chrome,
  Linkedin,
  Building,
  Shield,
  AlertCircle,
  Ticket
} from "lucide-react";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<"email" | "oauth" | "ad">("email");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [error, setError] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      // Simular autenticação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular MFA requerido para alguns usuários
      if (email === "admin@helpdesk.com") {
        setMfaRequired(true);
      } else {
        // Login bem-sucedido
        console.log("Login realizado:", { email, password });
      }
    } catch (err) {
      setError("Credenciais inválidas. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (mfaCode === "123456") {
        console.log("MFA validado com sucesso");
        // Redirecionar para dashboard
      } else {
        setError("Código OTP inválido");
      }
    } catch (err) {
      setError("Erro na validação MFA");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: "google" | "linkedin") => {
    console.log("Redirecionando para OAuth:", provider);
    // Implementar redirecionamento OAuth
  };

  const handleAdLogin = () => {
    console.log("Redirecionando para Active Directory");
    // Implementar autenticação AD
  };

  if (mfaRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle>Autenticação de Dois Fatores</CardTitle>
            <CardDescription>
              Digite o código de 6 dígitos do seu aplicativo autenticador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMfaValidation} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Código OTP</label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Validando..." : "Verificar Código"}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setMfaRequired(false);
                  setError("");
                  setMfaCode("");
                }}
              >
                Voltar ao Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Ticket className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle>HelpDesk Login</CardTitle>
          <CardDescription>
            Acesse o sistema de gerenciamento de tickets
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Método de Autenticação */}
          <div className="flex gap-1 mb-6 bg-muted p-1 rounded-lg">
            <Button
              variant={authMethod === "email" ? "secondary" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setAuthMethod("email")}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button
              variant={authMethod === "oauth" ? "secondary" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setAuthMethod("oauth")}
            >
              <Chrome className="h-4 w-4 mr-2" />
              OAuth
            </Button>
            <Button
              variant={authMethod === "ad" ? "secondary" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setAuthMethod("ad")}
            >
              <Building className="h-4 w-4 mr-2" />
              AD
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Login por Email/Senha */}
          {authMethod === "email" && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          )}

          {/* Login OAuth */}
          {authMethod === "oauth" && (
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthLogin("google")}
              >
                <Chrome className="h-4 w-4 mr-2" />
                Entrar com Google
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthLogin("linkedin")}
              >
                <Linkedin className="h-4 w-4 mr-2" />
                Entrar com LinkedIn
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                Você será redirecionado para autenticação externa
              </div>
            </div>
          )}

          {/* Login Active Directory */}
          {authMethod === "ad" && (
            <div className="space-y-4">
              <Button
                type="button"
                className="w-full"
                onClick={handleAdLogin}
              >
                <Building className="h-4 w-4 mr-2" />
                Entrar com Active Directory
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                Usar credenciais da empresa (SSO)
              </div>
            </div>
          )}

          {/* Demo Credentials */}
          <Separator className="my-6" />
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Credenciais de Demo:</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Admin:</span>
                <Badge variant="outline" className="text-xs">
                  admin@helpdesk.com / admin123
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Funcionário:</span>
                <Badge variant="outline" className="text-xs">
                  maria@helpdesk.com / maria123
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;