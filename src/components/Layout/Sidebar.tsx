import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
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
  Download,
  BookOpen
} from "lucide-react";

const getNavigationForRole = (userRole: string) => {
  const baseNavigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: BarChart3,
      current: true,
      roles: ['admin', 'owner', 'employee', 'user']
    },
    {
      name: "Novo Ticket",
      href: "/new-ticket",
      icon: Plus,
      current: false,
      roles: ['admin', 'owner', 'employee', 'user']
    },
    {
      name: "Meus Tickets",
      href: "/my-tickets",
      icon: Ticket,
      current: false,
      badge: "15",
      roles: ['employee', 'user']
    },
    {
      name: "Todos os Tickets",
      href: "/tickets",
      icon: Ticket,
      current: false,
      badge: "15",
      roles: ['admin', 'owner', 'employee'],
      children: [
        { name: "Abertos", href: "/tickets", icon: AlertTriangle, badge: "8", roles: ['admin', 'owner', 'employee'] },
        { name: "Aguardando", href: "/tickets/waiting", icon: Clock, badge: "3", roles: ['admin', 'owner', 'employee'] },
        { name: "Fechados", href: "/tickets/closed", icon: CheckCircle, badge: "4", roles: ['admin', 'owner', 'employee'] },
        { name: "Prioritários", href: "/tickets/high-priority", icon: Archive, badge: "2", roles: ['admin', 'owner', 'employee'] }
      ]
    },
    {
      name: "Usuários",
      href: "/users",
      icon: Users,
      current: false,
      roles: ['admin', 'owner']
    },
    {
      name: "Categorias",
      href: "/categories",
      icon: Tag,
      current: false,
      roles: ['admin', 'owner']
    },
    {
      name: "Comunidade",
      href: "/community",
      icon: Users,
      current: false,
      roles: ['admin', 'owner', 'employee', 'user']
    },
    {
      name: "Base de Conhecimento",
      href: "/knowledge-base",
      icon: BookOpen,
      current: false,
      roles: ['admin', 'owner', 'employee']
    },
    {
      name: "Relatórios",
      href: "/reports",
      icon: BarChart3,
      current: false,
      roles: ['admin', 'owner']
    },
    {
      name: "Configurações",
      href: "/settings",
      icon: Settings,
      current: false,
      roles: ['admin', 'owner']
    }
  ];

  return baseNavigation.filter(item => {
    if (!item.roles || item.roles.includes(userRole)) {
      if (item.children) {
        item.children = item.children.filter(child => 
          !child.roles || child.roles.includes(userRole)
        );
      }
      return true;
    }
    return false;
  });
};

const Sidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get user profile to determine role
  const [userRole, setUserRole] = useState<string>('user');
  const [userProfile, setUserProfile] = useState<any>(null);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          setUserRole(profile.role);
          setUserProfile(profile);
        }
      }
    };
    fetchUserProfile();
  }, [user]);

  // Get real ticket counts
  const { data: ticketCounts } = useQuery({
    queryKey: ['sidebar-ticket-counts', user?.id, userRole],
    queryFn: async () => {
      if (!user) return {};

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('user_id', user.id)
        .single();

      if (!profile) return {};

      let query = supabase.from('tickets').select('status, priority');

      // Apply role-based filtering
      if (profile.role === 'user') {
        query = query.eq('submitter_id', profile.id);
      } else if (profile.role === 'employee') {
        query = query.or(`submitter_id.eq.${profile.id},assignee_id.eq.${profile.id}`);
      }

      const { data: tickets } = await query;
      if (!tickets) return {};

      return {
        myTickets: profile.role === 'user' 
          ? tickets.length 
          : tickets.filter(t => t.status !== 'closed').length,
        allTickets: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        waiting: tickets.filter(t => t.status === 'waiting').length,
        closed: tickets.filter(t => t.status === 'closed').length,
        highPriority: tickets.filter(t => ['high', 'urgent'].includes(t.priority)).length,
      };
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const getNavigationWithCounts = (navigation: any[]) => {
    return navigation.map(item => {
      let badge = undefined;
      
      if (item.href === '/my-tickets') {
        badge = ticketCounts?.myTickets?.toString();
      } else if (item.href === '/tickets') {
        badge = ticketCounts?.allTickets?.toString();
      }
      
      if (item.children) {
        item.children = item.children.map((child: any) => {
          let childBadge = undefined;
          
          if (child.href === '/tickets') {
            childBadge = ticketCounts?.open?.toString();
          } else if (child.href === '/tickets/waiting') {
            childBadge = ticketCounts?.waiting?.toString();
          } else if (child.href === '/tickets/closed') {
            childBadge = ticketCounts?.closed?.toString();
          } else if (child.href === '/tickets/high-priority') {
            childBadge = ticketCounts?.highPriority?.toString();
          }
          
          return { ...child, badge: childBadge };
        });
      }
      
      return { ...item, badge };
    });
  };

  const navigation = getNavigationWithCounts(getNavigationForRole(userRole));

  const isCurrentPath = (href: string) => {
    if (href === '/' && location.pathname === '/') return true;
    if (href !== '/' && location.pathname.startsWith(href)) return true;
    return false;
  };

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
                variant={isCurrentPath(item.href) ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isCurrentPath(item.href) && "bg-secondary"
                )}
                onClick={() => navigate(item.href)}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </Button>

              {/* Sub-navigation */}
              {item.children && (
                <div className="ml-4 mt-2 space-y-1">
                  {item.children.map((child) => (
                    <Button
                      key={child.name}
                      variant={isCurrentPath(child.href) ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start text-sm"
                      onClick={() => navigate(child.href)}
                    >
                      <child.icon className="mr-2 h-3 w-3" />
                      {child.name}
                      {child.badge && (
                        <Badge variant="outline" className="ml-auto text-xs">
                          {child.badge}
                        </Badge>
                      )}
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