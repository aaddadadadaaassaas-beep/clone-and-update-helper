import Layout from "@/components/Layout/Layout";
import TicketForm from "@/components/Tickets/TicketForm";

const NewTicket = () => {
  const handleTicketSubmit = (data: any) => {
    console.log("Ticket criado:", data);
    // Aqui você implementaria a lógica para salvar o ticket
  };

  return (
    <Layout title="Novo Ticket" subtitle="Criar um novo ticket de suporte">
      <div className="flex justify-center">
        <TicketForm onSubmit={handleTicketSubmit} />
      </div>
    </Layout>
  );
};

export default NewTicket;