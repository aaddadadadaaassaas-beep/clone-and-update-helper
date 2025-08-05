import Layout from "@/components/Layout/Layout";
import StatsCard from "@/components/Dashboard/StatsCard";
import RecentTickets from "@/components/Dashboard/RecentTickets";
import { 
  Ticket, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users,
  TrendingUp
} from "lucide-react";

const Index = () => {
  return (
    <Layout title="Dashboard" subtitle="Visão geral do sistema de helpdesk">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total de Tickets"
            value="247"
            description="Todos os tickets no sistema"
            icon={Ticket}
            trend={{
              value: 12,
              label: "últimos 30 dias",
              type: "increase"
            }}
          />
          <StatsCard
            title="Tickets Abertos"
            value="24"
            description="Aguardando resolução"
            icon={AlertTriangle}
            variant="warning"
            trend={{
              value: 8,
              label: "desde ontem",
              type: "increase"
            }}
          />
          <StatsCard
            title="Aguardando"
            value="8"
            description="Pendente de resposta"
            icon={Clock}
            variant="warning"
          />
          <StatsCard
            title="Resolvidos Hoje"
            value="15"
            description="Tickets fechados hoje"
            icon={CheckCircle}
            variant="success"
            trend={{
              value: 25,
              label: "vs. ontem",
              type: "increase"
            }}
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Usuários Ativos"
            value="125"
            description="Usuários do sistema"
            icon={Users}
          />
          <StatsCard
            title="Tempo Médio"
            value="2.4h"
            description="Resolução de tickets"
            icon={TrendingUp}
            variant="success"
          />
          <StatsCard
            title="Taxa de Resolução"
            value="94%"
            description="Tickets resolvidos"
            icon={CheckCircle}
            variant="success"
          />
        </div>

        {/* Recent Tickets */}
        <RecentTickets />
      </div>
    </Layout>
  );
};

export default Index;
