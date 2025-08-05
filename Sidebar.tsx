import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Ticket, 
  Plus, 
  Users, 
  BarChart3, 
  Settings, 
  FileText,
  Search,
  Archive,
  AlertTriangle,
  Clock,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const navigationItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/",
      badge: null
    },
    {
      title: "Criar Ticket",
      icon: Plus,
      href: "/tickets/new",
      badge: null
    },
    {
      title: "Todos Tickets",
      icon: Ticket,
      href: "/tickets",
      badge: 24
    },
    {
      title: "Meus Tickets",
      icon: FileText,
      href: "/my-tickets",
      badge: 5
    },
    {
      title: "Aguardando",
      icon: Clock,
      href: "/tickets/waiting",
      badge: 8
    },
    {
      title: "Resolvidos",
      icon: CheckCircle,
      href: "/tickets/closed",
      badge: null
    },
    {
      title: "Alta Prioridade",
      icon: AlertTriangle,
      href: "/tickets/high-priority",
      badge: 3
    }
  ];

  const adminItems = [
    {
      title: "Usuários",
      icon: Users,
      href: "/admin/users",
      badge: null
    },
    {
      title: "Relatórios",
      icon: BarChart3,
      href: "/admin/reports",
      badge: null
    },
    {
      title: "Configurações",
      icon: Settings,
      href: "/admin/settings",
      badge: null
    },
    {
      title: "Arquivos",
      icon: Archive,
      href: "/admin/archive",
      badge: null
    }
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className={cn(
      "bg-card border-r border-border h-screen flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Ticket className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">HelpDesk</h1>
              <p className="text-xs text-muted-foreground">Sistema de Tickets</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar tickets..."
              className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-smooth"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-2 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-smooth group",
                isActive(item.href)
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-smooth",
                isActive(item.href) ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
              )} />
              {!isCollapsed && (
                <>
                  <span className="font-medium">{item.title}</span>
                  {item.badge && (
                    <Badge 
                      variant={isActive(item.href) ? "secondary" : "outline"}
                      className="ml-auto"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          ))}
        </nav>

        {/* Admin Section */}
        <div className="px-2 mt-6">
          {!isCollapsed && (
            <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Administração
            </h3>
          )}
          <nav className="space-y-1">
            {adminItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-smooth group",
                  isActive(item.href)
                    ? "bg-accent text-accent-foreground shadow-md"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-smooth",
                  isActive(item.href) ? "text-accent-foreground" : "text-muted-foreground group-hover:text-foreground"
                )} />
                {!isCollapsed && (
                  <span className="font-medium">{item.title}</span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* User Profile */}
      {!isCollapsed && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">AD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Admin User</p>
              <p className="text-xs text-muted-foreground truncate">admin@helpdesk.com</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;