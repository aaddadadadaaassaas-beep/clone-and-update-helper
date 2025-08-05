import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface NotificationData {
  to: string[];
  subject: string;
  ticketId: string;
  ticketTitle: string;
  eventType: 'created' | 'updated' | 'assigned' | 'closed' | 'comment' | 'reopened' | 'duplicated';
  message: string;
  userName?: string;
}

export const useNotifications = () => {
  const sendNotification = useMutation({
    mutationFn: async (data: NotificationData) => {
      console.log('Sending notification:', data);
      
      const { data: result, error } = await supabase.functions.invoke('send-notification', {
        body: data
      });

      if (error) {
        console.error('Notification error:', error);
        // Don't throw error for notifications to avoid blocking main operations
        return { success: false, error };
      }

      console.log('Notification sent successfully:', result);
      return result;
    }
  });

  const notifyTicketCreated = async (ticketId: string, ticketTitle: string, submitterName: string) => {
    console.log(`Preparing notification for ticket creation: ${ticketId}`);
    
    // Get all admins and employees for notification
    const { data: users } = await supabase
      .from('profiles')
      .select('email, full_name')
      .in('role', ['admin', 'owner', 'employee'])
      .eq('is_active', true);

    if (users && users.length > 0) {
      const recipients = users.map(u => u.email).filter(Boolean);
      console.log(`Notifying ${recipients.length} users about ticket creation`);
      
      await sendNotification.mutateAsync({
        to: recipients,
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
    console.log(`Preparing notification for ticket assignment: ${ticketId} to ${assigneeEmail}`);
    
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
    console.log(`Preparing notification for ticket closure: ${ticketId} to ${submitterEmail}`);
    
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
    console.log(`Preparing notification for new comment: ${ticketId} to ${recipients.length} recipients`);
    
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

  const notifyTicketReopened = async (
    ticketId: string, 
    ticketTitle: string, 
    recipients: string[], 
    reopenerName: string
  ) => {
    console.log(`Preparing notification for ticket reopening: ${ticketId}`);
    
    await sendNotification.mutateAsync({
      to: recipients,
      subject: `Ticket Reaberto: ${ticketTitle}`,
      ticketId,
      ticketTitle,
      eventType: 'reopened',
      message: `Este ticket foi reaberto para análise adicional.`,
      userName: reopenerName
    });
  };

  const notifyTicketDuplicated = async (
    ticketId: string, 
    ticketTitle: string, 
    submitterEmail: string, 
    moderatorName: string,
    duplicateTicketId: string
  ) => {
    console.log(`Preparing notification for ticket duplication: ${ticketId}`);
    
    await sendNotification.mutateAsync({
      to: [submitterEmail],
      subject: `Ticket Duplicado: ${ticketTitle}`,
      ticketId,
      ticketTitle,
      eventType: 'duplicated',
      message: `Seu ticket foi marcado como duplicado. Ticket relacionado: ${duplicateTicketId}`,
      userName: moderatorName
    });
  };

  return {
    sendNotification,
    notifyTicketCreated,
    notifyTicketAssigned,
    notifyTicketClosed,
    notifyNewComment,
    notifyTicketReopened,
    notifyTicketDuplicated
  };
};