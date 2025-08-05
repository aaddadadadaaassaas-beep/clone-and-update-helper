import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from "@/components/Layout/Layout";
import StatsCard from "@/components/Dashboard/StatsCard";
import RecentTickets from "@/components/Dashboard/RecentTickets";
import { 
  Ticket, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Users,
  TrendingUp,
  Star,
  Target
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data: tickets } = await supabase.from('tickets').select('*');
      const { data: profiles } = await supabase.from('profiles').select('*');
      
      const totalTickets = tickets?.length || 0;
      const openTickets = tickets?.filter(t => t.status === 'open').length || 0;
      const inProgress = tickets?.filter(t => t.status === 'waiting').length || 0;
      const closedToday = tickets?.filter(t => 
        t.status === 'closed' && 
        new Date(t.closed_at || '').toDateString() === new Date().toDateString()
      ).length || 0;
      
      return {
        totalTickets,
        openTickets,
        inProgress,
        closedToday,
        activeUsers: profiles?.filter(p => p.is_active).length || 0,
        resolutionRate: totalTickets ? Math.round((tickets?.filter(t => t.status === 'closed').length || 0) / totalTickets * 100) : 0
      };
    }
  });

  const statsData = [
    {
      title: "Total de Tickets",
      value: stats?.totalTickets?.toString() || "0",
      description: "Total geral no sistema",
      icon: Ticket,
      trend: { value: 12, isPositive: true }
    },
    {
      title: "Tickets Abertos",
      value: stats?.openTickets?.toString() || "0",
      description: "Aguardando atendimento",
      icon: AlertTriangle,
      trend: { value: 5, isPositive: false }
    },
    {
      title: "Em Andamento", 
      value: stats?.inProgress?.toString() || "0",
      description: "Sendo processados",
      icon: Clock,
      trend: { value: 8, isPositive: true }
    },
    {
      title: "Resolvidos Hoje",
      value: stats?.closedToday?.toString() || "0",
      description: "Finalizados nas últimas 24h",
      icon: CheckCircle,
      trend: { value: 15, isPositive: true }
    },
    {
      title: "Usuários Ativos",
      value: stats?.activeUsers?.toString() || "0",
      description: "Usuários no sistema",
      icon: Users,
      trend: { value: 3, isPositive: true }
    },
    {
      title: "Taxa de Resolução",
      value: `${stats?.resolutionRate || 0}%`,
      description: "Tickets resolvidos",
      icon: Target,
      trend: { value: 2, isPositive: true }
    },
    {
      title: "Tempo Médio",
      value: "2.4h",
      description: "Tempo médio de resolução",
      icon: TrendingUp,
      trend: { value: 10, isPositive: true }
    },
    {
      title: "Satisfação",
      value: "4.8",
      description: "Avaliação média dos usuários",
      icon: Star,
      trend: { value: 0.2, isPositive: true }
    }
  ];

  return (
    <Layout title="Dashboard" subtitle="Visão geral do sistema de tickets">
      <div className="space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
              trend={stat.trend}
            />
          ))}
        </div>

        {/* Tickets Recentes */}
        <RecentTickets />
      </div>
    </Layout>
  );
};

export default Index;