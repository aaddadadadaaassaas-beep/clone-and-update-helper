import Layout from "@/components/Layout/Layout";
import RecentTickets from "@/components/Dashboard/RecentTickets";
import DashboardMetrics from "@/components/Dashboard/DashboardMetrics";

const Index = () => {
  return (
    <Layout title="Dashboard" subtitle="Visão geral do sistema de tickets">
      <div className="space-y-6">
        <DashboardMetrics />
        <RecentTickets />
      </div>
    </Layout>
  );
};

export default Index;