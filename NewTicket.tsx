import Layout from "@/components/Layout/Layout";
import TicketForm from "@/components/Tickets/TicketForm";

const NewTicket = () => {
  const handleTicketSubmit = (data: any) => {
    console.log("Ticket criado:", data);
    // Aqui seria a integração com o backend
  };

  return (
    <Layout 
      title="Criar Ticket" 
      subtitle="Abra um novo chamado de suporte"
    >
      <div className="max-w-4xl mx-auto">
        <TicketForm onSubmit={handleTicketSubmit} />
      </div>
    </Layout>
  );
};

export default NewTicket;