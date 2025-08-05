import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  Clock, 
  User, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Archive,
  Edit,
  Send,
  UserPlus
} from "lucide-react";

interface TicketDetailsProps {
  ticket: {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    category: string;
    assignee?: string;
    requester: string;
    createdAt: string;
    updatedAt: string;
    dueDate?: string;
    tags?: string[];
  };
  onStatusChange: (ticketId: string, status: string) => void;
  onAssign: (ticketId: string, assignee: string) => void;
  onAddComment: (ticketId: string, comment: string, isPrivate: boolean) => void;
  onClose: (ticketId: string, comment?: string) => void;
}

const TicketDetails = ({ 
  ticket, 
  onStatusChange, 
  onAssign, 
  onAddComment, 
  onClose 
}: TicketDetailsProps) => {
  const [newComment, setNewComment] = useState("");
  const [isPrivateComment, setIsPrivateComment] = useState(false);
  const [closingComment, setClosingComment] = useState("");
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  const getStatusBadge = (status: string) => {
    const configs = {
      open: { label: "Aberto", variant: "destructive" as const, icon: AlertTriangle },
      waiting: { label: "Aguardando", variant: "secondary" as const, icon: Clock },
      closed: { label: "Fechado", variant: "default" as const, icon: CheckCircle }
    };
    
    const config = configs[status as keyof typeof configs] || configs.open;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="text-xs">
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const configs = {
      low: { label: "Baixa", variant: "outline" as const },
      medium: { label: "Média", variant: "secondary" as const },
      high: { label: "Alta", variant: "destructive" as const }
    };
    
    const config = configs[priority as keyof typeof configs] || configs.medium;
    
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(ticket.id, newComment, isPrivateComment);
      setNewComment("");
      setIsPrivateComment(false);
    }
  };

  const handleClose = () => {
    onClose(ticket.id, closingComment);
    setShowCloseDialog(false);
    setClosingComment("");
  };

  const mockComments = [
    {
      id: "1",
      author: "João Silva",
      content: "Tentei reiniciar o computador mas o problema persiste.",
      isPrivate: false,
      createdAt: "2024-01-15T10:30:00Z"
    },
    {
      id: "2", 
      author: "Maria Santos",
      content: "Verificando logs do sistema. Possível problema de driver.",
      isPrivate: true,
      createdAt: "2024-01-15T11:15:00Z"
    }
  ];

  const mockEmployees = [
    { id: "1", name: "Maria Santos", role: "admin" },
    { id: "2", name: "Pedro Costa", role: "employee" },
    { id: "3", name: "Ana Silva", role: "employee" }
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Ticket */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-3">
                #{ticket.id} - {ticket.title}
                {getStatusBadge(ticket.status)}
              </CardTitle>
              <CardDescription className="mt-2">
                {ticket.description}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {ticket.status !== 'closed' && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowCloseDialog(true)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Fechar Ticket
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Select 
                value={ticket.status} 
                onValueChange={(value) => onStatusChange(ticket.id, value)}
                disabled={ticket.status === 'closed'}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Aberto</SelectItem>
                  <SelectItem value="waiting">Aguardando</SelectItem>
                  <SelectItem value="closed">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Prioridade</label>
              {getPriorityBadge(ticket.priority)}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Categoria</label>
              <Badge variant="outline">{ticket.category}</Badge>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Responsável</label>
              <Select 
                value={ticket.assignee || ""} 
                onValueChange={(value) => onAssign(ticket.id, value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Atribuir" />
                </SelectTrigger>
                <SelectContent>
                  {mockEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Solicitante:</span>
              <span>{ticket.requester}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Criado:</span>
              <span>{new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Atualizado:</span>
              <span>{new Date(ticket.updatedAt).toLocaleDateString('pt-BR')}</span>
            </div>
            {ticket.dueDate && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Vencimento:</span>
                <span>{new Date(ticket.dueDate).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comentários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comentários
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockComments.map((comment) => (
            <div key={comment.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="text-xs">
                      {comment.author.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">{comment.author}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleString('pt-BR')}
                  </span>
                  {comment.isPrivate && (
                    <Badge variant="outline" className="text-xs">
                      Privado
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-sm pl-8">{comment.content}</p>
              <Separator />
            </div>
          ))}
          
          {/* Adicionar Comentário */}
          {ticket.status !== 'closed' && (
            <div className="space-y-3 border-t pt-4">
              <Textarea
                placeholder="Adicionar comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="private"
                    checked={isPrivateComment}
                    onChange={(e) => setIsPrivateComment(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="private" className="text-sm">
                    Comentário privado (apenas para a equipe)
                  </label>
                </div>
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Fechamento */}
      {showCloseDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Fechar Ticket</CardTitle>
              <CardDescription>
                Adicione um comentário de resolução (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Descreva como o problema foi resolvido..."
                value={closingComment}
                onChange={(e) => setClosingComment(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCloseDialog(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleClose}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Fechar Ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TicketDetails;