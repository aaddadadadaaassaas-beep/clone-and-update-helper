import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  to: string[];
  subject: string;
  ticketId: string;
  ticketTitle: string;
  eventType: 'created' | 'updated' | 'assigned' | 'closed' | 'comment';
  message: string;
  userName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      to, 
      subject, 
      ticketId, 
      ticketTitle, 
      eventType, 
      message,
      userName 
    }: NotificationRequest = await req.json();

    console.log('Sending notification:', { to, subject, eventType, ticketId });

    // For now, just log the notification (since we don't have Resend configured)
    // In a real implementation, you would send emails here
    const notification = {
      to,
      subject,
      content: generateEmailContent(ticketId, ticketTitle, eventType, message, userName),
      timestamp: new Date().toISOString()
    };

    console.log('Notification would be sent:', notification);

    // Simulate successful email sending
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification processed successfully',
        notification 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generateEmailContent(
  ticketId: string, 
  ticketTitle: string, 
  eventType: string, 
  message: string,
  userName?: string
): string {
  const baseUrl = "https://your-app-url.com"; // Replace with actual URL
  const ticketUrl = `${baseUrl}/tickets/${ticketId}`;
  
  const templates = {
    created: `
      <h2>Novo Ticket Criado</h2>
      <p>Um novo ticket foi criado no sistema:</p>
      <h3>${ticketTitle}</h3>
      <p><strong>ID:</strong> #${ticketId.slice(0, 8)}</p>
      <p><strong>Criado por:</strong> ${userName || 'Sistema'}</p>
      <p><strong>Descrição:</strong> ${message}</p>
      <a href="${ticketUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Ticket</a>
    `,
    updated: `
      <h2>Ticket Atualizado</h2>
      <p>O ticket foi atualizado:</p>
      <h3>${ticketTitle}</h3>
      <p><strong>ID:</strong> #${ticketId.slice(0, 8)}</p>
      <p><strong>Atualizado por:</strong> ${userName || 'Sistema'}</p>
      <p><strong>Alterações:</strong> ${message}</p>
      <a href="${ticketUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Ticket</a>
    `,
    assigned: `
      <h2>Ticket Atribuído</h2>
      <p>Um ticket foi atribuído a você:</p>
      <h3>${ticketTitle}</h3>
      <p><strong>ID:</strong> #${ticketId.slice(0, 8)}</p>
      <p><strong>Atribuído por:</strong> ${userName || 'Sistema'}</p>
      <p><strong>Detalhes:</strong> ${message}</p>
      <a href="${ticketUrl}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Ticket</a>
    `,
    closed: `
      <h2>Ticket Fechado</h2>
      <p>O ticket foi fechado:</p>
      <h3>${ticketTitle}</h3>
      <p><strong>ID:</strong> #${ticketId.slice(0, 8)}</p>
      <p><strong>Fechado por:</strong> ${userName || 'Sistema'}</p>
      <p><strong>Resolução:</strong> ${message}</p>
      <a href="${ticketUrl}" style="background: #6c757d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Ticket</a>
    `,
    comment: `
      <h2>Novo Comentário</h2>
      <p>Um novo comentário foi adicionado ao ticket:</p>
      <h3>${ticketTitle}</h3>
      <p><strong>ID:</strong> #${ticketId.slice(0, 8)}</p>
      <p><strong>Comentário de:</strong> ${userName || 'Sistema'}</p>
      <p><strong>Comentário:</strong> ${message}</p>
      <a href="${ticketUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Ticket</a>
    `
  };

  return templates[eventType as keyof typeof templates] || templates.updated;
}

serve(handler);