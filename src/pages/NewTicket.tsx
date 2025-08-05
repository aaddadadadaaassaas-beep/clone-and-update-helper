import Layout from "@/components/Layout/Layout";
import TicketForm from "@/components/Tickets/TicketForm";

const NewTicket = () => {
  return (
    <Layout title="Novo Ticket" subtitle="Criar um novo ticket de suporte">
      <div className="flex justify-center">
        <TicketForm />
      </div>
    </Layout>
  );
};

export default NewTicket;