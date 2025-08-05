import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Ticket, 
  Plus, 
  BarChart3, 
  Users, 
  Settings, 
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Archive,
  Tag,
  MessageSquare,
  Upload,
  Download
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: BarChart3,
    current: true
  },
  {
    name: "Novo Ticket",
    href: "/new-ticket",
    icon: Plus,
    current: false
  },
  {
    name: "Todos os Tickets",
    href: "/tickets",
    icon: Ticket,
    current: false,
    badge: "15"
  },
  {
    name: "Views",
    href: "#",
    icon: FileText,
    current: false,
    children: [
      { name: "Abertos", href: "/tickets?status=open", icon: AlertTriangle, badge: "8" },
      { name: "Aguardando", href: "/tickets?status=waiting", icon: Clock, badge: "3" },
      { name: "Fechados", href: "/tickets?status=closed", icon: CheckCircle, badge: "4" },
      { name: "Vencidos", href: "/tickets?overdue=true", icon: Archive, badge: "2" }
    ]
  },
  {
    name: "Usuários",
    href: "/users",
    icon: Users,
    current: false
  },
  {
    name: "Categorias",
    href: "/categories",
    icon: Tag,
    current: false
  },
  {
    name: "Comentários",
    href: "/comments",
    icon: MessageSquare,
    current: false
  },
  {
    name: "Relatórios",
    href: "#",
    icon: BarChart3,
    current: false,
    children: [
      { name: "Exportar JSON", href: "/reports/export", icon: Download },
      { name: "Importar Dados", href: "/reports/import", icon: Upload },
      { name: "Operações em Lote", href: "/reports/bulk", icon: Archive }
    ]
  },
  {
    name: "Configurações",
    href: "/settings",
    icon: Settings,
    current: false
  }
];

const Sidebar = () => {
  return (
    <div className="flex h-full w-72 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Ticket className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">HelpDesk</h1>
            <p className="text-xs text-muted-foreground">Sistema de Tickets</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => (
            <div key={item.name}>
              <Button
                variant={item.current ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  item.current && "bg-secondary"
                )}
                asChild
              >
                <a href={item.href}>
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </a>
              </Button>

              {/* Sub-navigation */}
              {item.children && (
                <div className="ml-4 mt-2 space-y-1">
                  {item.children.map((child) => (
                    <Button
                      key={child.name}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm"
                      asChild
                    >
                      <a href={child.href}>
                        <child.icon className="mr-2 h-3 w-3" />
                        {child.name}
                        {child.badge && (
                          <Badge variant="outline" className="ml-auto text-xs">
                            {child.badge}
                          </Badge>
                        )}
                      </a>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="text-center text-xs text-muted-foreground">
          <p>HelpDesk v2.0</p>
          <p>© 2024 Sistema de Tickets</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;