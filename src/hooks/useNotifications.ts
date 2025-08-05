import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface NotificationData {
  to: string[];
  subject: string;
  ticketId: string;
  ticketTitle: string;
  eventType: 'created' | 'updated' | 'assigned' | 'closed' | 'comment';
  message: string;
  userName?: string;
}

export const useNotifications = () => {
  const sendNotification = useMutation({
    mutationFn: async (data: NotificationData) => {
      const { data: result, error } = await supabase.functions.invoke('send-notification', {
        body: data
      });

      if (error) {
        console.error('Notification error:', error);
        // Don't throw error for notifications to avoid blocking main operations
        return { success: false, error };
      }

      return result;
    }
  });

  const notifyTicketCreated = async (ticketId: string, ticketTitle: string, submitterName: string) => {
    // Get all admins and employees for notification
    const { data: users } = await supabase
      .from('profiles')
      .select('email, full_name')
      .in('role', ['admin', 'owner', 'employee'])
      .eq('is_active', true);

    if (users && users.length > 0) {
      await sendNotification.mutateAsync({
        to: users.map(u => u.email),
        subject: `Novo Ticket: ${ticketTitle}`,
        ticketId,
        ticketTitle,
        eventType: 'created',
        message: `Um novo ticket foi criado e precisa de atenção.`,
        userName: submitterName
      });
    }
  };

  const notifyTicketAssigned = async (
    ticketId: string, 
    ticketTitle: string, 
    assigneeEmail: string, 
    assignerName: string
  ) => {
    await sendNotification.mutateAsync({
      to: [assigneeEmail],
      subject: `Ticket Atribuído: ${ticketTitle}`,
      ticketId,
      ticketTitle,
      eventType: 'assigned',
      message: `Este ticket foi atribuído para você.`,
      userName: assignerName
    });
  };

  const notifyTicketClosed = async (
    ticketId: string, 
    ticketTitle: string, 
    submitterEmail: string, 
    resolverName: string
  ) => {
    await sendNotification.mutateAsync({
      to: [submitterEmail],
      subject: `Ticket Resolvido: ${ticketTitle}`,
      ticketId,
      ticketTitle,
      eventType: 'closed',
      message: `Seu ticket foi resolvido e fechado.`,
      userName: resolverName
    });
  };

  const notifyNewComment = async (
    ticketId: string, 
    ticketTitle: string, 
    recipients: string[], 
    commenterName: string,
    commentContent: string
  ) => {
    await sendNotification.mutateAsync({
      to: recipients,
      subject: `Novo Comentário: ${ticketTitle}`,
      ticketId,
      ticketTitle,
      eventType: 'comment',
      message: commentContent.length > 100 
        ? `${commentContent.substring(0, 100)}...` 
        : commentContent,
      userName: commenterName
    });
  };

  return {
    sendNotification,
    notifyTicketCreated,
    notifyTicketAssigned,
    notifyTicketClosed,
    notifyNewComment
  };
};