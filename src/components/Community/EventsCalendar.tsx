import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar,
  Clock,
  Users,
  Plus,
  Search,
  MapPin,
  Video,
  Coffee,
  Presentation,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'webinar' | 'workshop' | 'meetup' | 'conference';
  location: string;
  isOnline: boolean;
  attendees: number;
  maxAttendees?: number;
  organizer: string;
  tags: string[];
  isRegistered: boolean;
}

const EventsCalendar = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const events: Event[] = [
    {
      id: "1",
      title: "Webinar: Estratégias de Atendimento ao Cliente",
      description: "Aprenda as melhores práticas para melhorar a satisfação do cliente",
      date: "2024-02-15",
      time: "14:00",
      type: "webinar",
      location: "Online",
      isOnline: true,
      attendees: 89,
      maxAttendees: 200,
      organizer: "HelpDesk Team",
      tags: ["atendimento", "estratégia", "online"],
      isRegistered: false
    },
    {
      id: "2",
      title: "Workshop: Configuração Avançada do Sistema",
      description: "Workshop prático sobre configurações avançadas e automações",
      date: "2024-02-20",
      time: "09:00",
      type: "workshop",
      location: "São Paulo - SP",
      isOnline: false,
      attendees: 15,
      maxAttendees: 30,
      organizer: "Ana Silva",
      tags: ["configuração", "automação", "prático"],
      isRegistered: true
    },
    {
      id: "3",
      title: "Meetup: Comunidade HelpDesk Brasil",
      description: "Encontro mensal da comunidade para networking e troca de experiências",
      date: "2024-02-25",
      time: "18:30",
      type: "meetup",
      location: "Rio de Janeiro - RJ",
      isOnline: false,
      attendees: 42,
      maxAttendees: 50,
      organizer: "Carlos Santos",
      tags: ["networking", "comunidade", "experiências"],
      isRegistered: false
    }
  ];

  const eventTypes = [
    { value: "webinar", label: "Webinars", icon: Video },
    { value: "workshop", label: "Workshops", icon: Presentation },
    { value: "meetup", label: "Meetups", icon: Coffee },
    { value: "conference", label: "Conferências", icon: Users }
  ];

  const getEventIcon = (type: string) => {
    const eventType = eventTypes.find(t => t.value === type);
    const Icon = eventType?.icon || Calendar;
    return <Icon className="h-4 w-4" />;
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      webinar: "bg-blue-100 text-blue-800",
      workshop: "bg-green-100 text-green-800", 
      meetup: "bg-purple-100 text-purple-800",
      conference: "bg-orange-100 text-orange-800"
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const handleRegister = (eventId: string) => {
    toast({
      title: "Inscrição realizada!",
      description: "Você se inscreveu no evento com sucesso.",
    });
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || event.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <CardTitle>Calendário de Eventos</CardTitle>
              <p className="text-muted-foreground mt-1">
                Participe de webinars, workshops e meetups da comunidade
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Evento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("all")}
              >
                Todos
              </Button>
              {eventTypes.map((type) => (
                <Button
                  key={type.value}
                  variant={selectedType === type.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type.value)}
                >
                  <type.icon className="h-3 w-3 mr-1" />
                  {type.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between mb-2">
                <Badge className={`${getEventTypeColor(event.type)} text-xs`}>
                  {getEventIcon(event.type)}
                  <span className="ml-1 capitalize">{event.type}</span>
                </Badge>
                {event.isRegistered && (
                  <Badge variant="secondary" className="text-xs">
                    ✓ Inscrito
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {event.description}
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(event.date).toLocaleDateString('pt-BR')} às {event.time}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {event.isOnline ? (
                    <Video className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span>{event.location}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {event.attendees} participante{event.attendees !== 1 ? 's' : ''}
                    {event.maxAttendees && ` / ${event.maxAttendees}`}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">Organizador:</span>
                  <span className="text-xs font-medium">{event.organizer}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {event.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                {!event.isRegistered ? (
                  <Button 
                    className="flex-1" 
                    size="sm"
                    onClick={() => handleRegister(event.id)}
                  >
                    Inscrever-se
                  </Button>
                ) : (
                  <Button variant="outline" className="flex-1" size="sm">
                    Cancelar Inscrição
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum evento encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou criar um novo evento.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EventsCalendar;