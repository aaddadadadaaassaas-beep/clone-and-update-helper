import { useState } from 'react';
import Layout from "@/components/Layout/Layout";
import TicketsList from "@/components/Tickets/TicketsList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket, Clock, CheckCircle, AlertCircle } from "lucide-react";

const MyTickets = () => {
  const [activeTab, setActiveTab] = useState('all');

  const tabConfig = [
    { 
      id: 'all', 
      label: 'Todos', 
      icon: Ticket,
      view: 'my-tickets' as const
    },
    { 
      id: 'open', 
      label: 'Abertos', 
      icon: AlertCircle,
      view: 'my-tickets-open' as const
    },
    { 
      id: 'waiting', 
      label: 'Aguardando', 
      icon: Clock,
      view: 'my-tickets-waiting' as const
    },
    { 
      id: 'closed', 
      label: 'Fechados', 
      icon: CheckCircle,
      view: 'my-tickets-closed' as const
    },
  ];

  return (
    <Layout 
      title="Meus Tickets" 
      subtitle="Tickets criados ou atribuídos a você"
    >
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            {tabConfig.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {tabConfig.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-6">
              <TicketsList view={tab.view} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
};

export default MyTickets;