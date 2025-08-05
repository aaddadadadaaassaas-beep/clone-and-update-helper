import Layout from "@/components/Layout/Layout";
import TicketsList from "@/components/Tickets/TicketsList";
import { useLocation } from "react-router-dom";

const Tickets = () => {
  const location = useLocation();
  
  // Determine view based on path
  const getViewFromPath = () => {
    if (location.pathname === '/my-tickets') return 'my-tickets';
    if (location.pathname === '/tickets/waiting') return 'waiting';
    if (location.pathname === '/tickets/closed') return 'closed';
    if (location.pathname === '/tickets/high-priority') return 'high-priority';
    return 'all';
  };

  const view = getViewFromPath();

  const getPageTitle = () => {
    switch (view) {
      case 'my-tickets': return 'Meus Tickets';
      case 'waiting': return 'Tickets Aguardando';
      case 'closed': return 'Tickets Fechados';
      case 'high-priority': return 'Tickets Prioritários';
      default: return 'Gerenciar Tickets';
    }
  };

  const getPageSubtitle = () => {
    switch (view) {
      case 'my-tickets': return 'Tickets criados ou atribuídos a você';
      case 'waiting': return 'Tickets aguardando atendimento';
      case 'closed': return 'Tickets finalizados';
      case 'high-priority': return 'Tickets com alta prioridade';
      default: return 'Visualize e gerencie todos os tickets do sistema';
    }
  };

  return (
    <Layout title={getPageTitle()} subtitle={getPageSubtitle()}>
      <TicketsList view={view} />
    </Layout>
  );
};

export default Tickets;