import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, Calendar, Clock, MessageSquare, Paperclip } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout/Layout';
import CommentsSection from '@/components/Tickets/CommentsSection';
import AttachmentsList from '@/components/Tickets/AttachmentsList';
import FileUpload from '@/components/Tickets/FileUpload';
import TicketHistory from '@/components/Tickets/TicketHistory';
import TicketDuplication from '@/components/Tickets/TicketDuplication';
import TicketReopen from '@/components/Tickets/TicketReopen';
import { useUsers } from '@/hooks/useUsers';

const TicketDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [userRole, setUserRole] = useState<string>('user');
  const { user } = useAuth();
  const { data: users } = useUsers();

  // Get user role
  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          setUserRole(profile.role);
        }
      }
    };
    fetchUserRole();
  }, [user]);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          category:categories(*),
          submitter:profiles!tickets_submitter_id_fkey(full_name, email, user_id),
          assignee:profiles!tickets_assignee_id_fkey(full_name, email, user_id)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const updateTicketMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast({
        title: "Ticket atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: async (commentData: { content: string; is_private: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const { data, error } = await supabase
        .from('comments')
        .insert({
          ticket_id: id,
          user_id: profile?.id,
          content: commentData.content,
          is_private: commentData.is_private
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setComment('');
      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi adicionado com sucesso.",
      });
    }
  });

  const handleStatusUpdate = (status: string) => {
    const updates: any = { status };
    if (status === 'closed') {
      updates.closed_at = new Date().toISOString();
    }
    updateTicketMutation.mutate(updates);
  };

  const handleAssigneeUpdate = (assigneeId: string) => {
    updateTicketMutation.mutate({ 
      assignee_id: assigneeId === 'unassigned' ? null : assigneeId 
    });
  };

  const handlePriorityUpdate = (priority: string) => {
    updateTicketMutation.mutate({ priority });
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;
    addCommentMutation.mutate({
      content: comment,
      is_private: isPrivate
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'normal': return 'bg-gray-100 text-gray-800';
      case 'high': return 'bg-yellow-100 text-yellow-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Layout title="Detalhes do Ticket">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!ticket) {
    return (
      <Layout title="Ticket não encontrado">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Ticket não encontrado.</p>
          <Button onClick={() => navigate('/tickets')} className="mt-4">
            Voltar para Tickets
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Ticket #${ticket.id.slice(0, 8)}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/tickets')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{ticket.title}</h1>
              <p className="text-muted-foreground">Ticket #{ticket.id.slice(0, 8)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(ticket.status)}>
              {ticket.status === 'open' ? 'Aberto' : 
               ticket.status === 'waiting' ? 'Aguardando' : 'Fechado'}
            </Badge>
            <Badge className={getPriorityColor(ticket.priority)}>
              {ticket.priority === 'low' ? 'Baixa' :
               ticket.priority === 'normal' ? 'Normal' :
               ticket.priority === 'high' ? 'Alta' : 'Urgente'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Descrição</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{ticket.description}</p>
              </CardContent>
            </Card>

            {/* Attachments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Anexos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AttachmentsList ticketId={ticket.id} />
                <Separator className="my-4" />
                <FileUpload
                  ticketId={ticket.id}
                  maxFiles={5}
                />
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Comentários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CommentsSection ticketId={ticket.id} />
                
                {/* Add Comment */}
                <div className="mt-6 space-y-4">
                  <Textarea
                    placeholder="Adicionar comentário..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex items-center justify-between">
                    {(userRole === 'admin' || userRole === 'owner' || userRole === 'employee') && (
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isPrivate}
                          onChange={(e) => setIsPrivate(e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">Comentário privado</span>
                      </label>
                    )}
                    <Button onClick={handleAddComment} disabled={!comment.trim()}>
                      Adicionar Comentário
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* History */}
            <TicketHistory ticketId={ticket.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Actions - Only for admin, owner, and employee */}
            {(userRole === 'admin' || userRole === 'owner' || userRole === 'employee') && (
              <Card>
                <CardHeader>
                  <CardTitle>Ações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={ticket.status} onValueChange={handleStatusUpdate}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Aberto</SelectItem>
                        <SelectItem value="waiting">Aguardando</SelectItem>
                        <SelectItem value="closed">Fechado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Prioridade</label>
                    <Select value={ticket.priority} onValueChange={handlePriorityUpdate}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Assignee - Only for admin and owner */}
                  {(userRole === 'admin' || userRole === 'owner') && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Responsável</label>
                      <Select 
                        value={ticket.assignee_id || 'unassigned'} 
                        onValueChange={handleAssigneeUpdate}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Não atribuído</SelectItem>
                          {users?.filter(user => ['admin', 'owner'].includes(user.role))
                            .map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.full_name}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Due Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data de Vencimento</label>
                    <Input
                      type="datetime-local"
                      value={ticket.due_date ? new Date(ticket.due_date).toISOString().slice(0, 16) : ''}
                      onChange={(e) => {
                        const dueDate = e.target.value ? new Date(e.target.value).toISOString() : null;
                        updateTicketMutation.mutate({ due_date: dueDate });
                      }}
                    />
                  </div>

                  {/* Special Actions */}
                  <div className="pt-4 space-y-2">
                    <TicketDuplication 
                      originalTicketId={ticket.id}
                      onTicketCreated={() => queryClient.invalidateQueries({ queryKey: ['ticket', id] })}
                    />
                    <TicketReopen 
                      ticketId={ticket.id}
                      currentStatus={ticket.status}
                      onTicketReopened={() => queryClient.invalidateQueries({ queryKey: ['ticket', id] })}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Solicitante</p>
                    <p className="text-sm text-muted-foreground">{ticket.submitter?.full_name}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Criado em</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                {ticket.assignee && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Responsável</p>
                      <p className="text-sm text-muted-foreground">{ticket.assignee.full_name}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Última atualização</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(ticket.updated_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                {ticket.due_date && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Vencimento</p>
                      <p className={`text-sm ${
                        new Date(ticket.due_date) < new Date() 
                          ? 'text-red-600 font-medium' 
                          : 'text-muted-foreground'
                      }`}>
                        {new Date(ticket.due_date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        {new Date(ticket.due_date) < new Date() && ' (Vencido)'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 rounded-full" style={{ backgroundColor: ticket.category?.color }} />
                  <div>
                    <p className="text-sm font-medium">Categoria</p>
                    <p className="text-sm text-muted-foreground">{ticket.category?.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TicketDetails;