import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Moon, 
  Sun,
  Search
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

const Header = ({ title = "Dashboard", subtitle }: HeaderProps) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const notifications = [
    {
      id: 1,
      title: "Novo ticket #1234",
      message: "Ticket de alta prioridade criado",
      time: "2 min atrás",
      unread: true
    },
    {
      id: 2,
      title: "Ticket #1233 resolvido",
      message: "Problema de login resolvido",
      time: "15 min atrás",
      unread: true
    },
    {
      id: 3,
      title: "Usuário adicionado",
      message: "João Silva foi adicionado ao sistema",
      time: "1 hora atrás",
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-64 pl-10 pr-4 py-2 bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-smooth"
            />
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-9 w-9 p-0"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                Notificações
                {unreadCount > 0 && (
                  <Badge variant="secondary">{unreadCount} novas</Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="p-4 cursor-pointer">
                  <div className="flex items-start space-x-3 w-full">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notification.unread ? 'bg-primary' : 'bg-muted'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center text-primary cursor-pointer">
                Ver todas as notificações
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 px-3 space-x-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-primary-foreground">AD</span>
                </div>
                <span className="hidden md:block text-sm font-medium">Admin User</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>Admin User</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    admin@helpdesk.com
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Meu Perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;