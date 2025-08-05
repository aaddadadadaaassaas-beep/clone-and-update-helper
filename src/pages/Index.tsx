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

const Index = () => {
  const statsData = [
    {
      title: "Total de Tickets",
      value: "247",
      description: "Total geral no sistema",
      icon: Ticket,
      trend: { value: 12, isPositive: true }
    },
    {
      title: "Tickets Abertos",
      value: "23",
      description: "Aguardando atendimento",
      icon: AlertTriangle,
      trend: { value: 5, isPositive: false }
    },
    {
      title: "Em Andamento", 
      value: "15",
      description: "Sendo processados",
      icon: Clock,
      trend: { value: 8, isPositive: true }
    },
    {
      title: "Resolvidos Hoje",
      value: "12",
      description: "Finalizados nas últimas 24h",
      icon: CheckCircle,
      trend: { value: 15, isPositive: true }
    },
    {
      title: "Usuários Ativos",
      value: "156",
      description: "Usuários no sistema",
      icon: Users,
      trend: { value: 3, isPositive: true }
    },
    {
      title: "Taxa de Resolução",
      value: "94%",
      description: "Tickets resolvidos no prazo",
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