import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  to: string[];
  subject: string;
  ticketId: string;
  ticketTitle: string;
  eventType: 'created' | 'updated' | 'assigned' | 'closed' | 'comment' | 'reopened' | 'duplicated';
  message: string;
  userName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, ticketId, ticketTitle, eventType, message, userName }: NotificationRequest = await req.json();

    console.log(`Processing notification for event: ${eventType}, ticket: ${ticketId}`);

    // Create Supabase client for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if notifications are enabled for this event type
    const { data: settings } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('event_type', eventType)
      .eq('is_enabled', true);

    if (!settings || settings.length === 0) {
      console.log(`No active notification settings found for event type: ${eventType}`);
      return new Response(JSON.stringify({ message: 'No active notifications for this event' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Generate email content based on event type
    const emailContent = generateEmailContent(eventType, ticketTitle, ticketId, message, userName);

    // Send email to each recipient
    const emailPromises = to.map(async (email) => {
      try {
        const emailResponse = await resend.emails.send({
          from: "HelpDesk Sistema <noreply@lovable.app>",
          to: [email],
          subject: subject,
          html: emailContent,
        });

        console.log(`Email sent to ${email}:`, emailResponse);
        return { email, success: true, id: emailResponse.data?.id };
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        return { email, success: false, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r.success).length;

    console.log(`Notification summary: ${successCount}/${results.length} emails sent successfully`);

    return new Response(JSON.stringify({
      success: true,
      emailsSent: successCount,
      totalEmails: results.length,
      results
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-notification function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generateEmailContent(
  eventType: string, 
  ticketTitle: string, 
  ticketId: string, 
  message: string, 
  userName?: string
): string {
  const ticketLink = `${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || 'https://your-app.lovable.app'}/tickets/${ticketId}`;
  const shortTicketId = ticketId.slice(0, 8);

  let eventTitle = '';
  let eventDescription = '';
  let actionColor = '#3b82f6';

  switch (eventType) {
    case 'created':
      eventTitle = '🎫 Novo Ticket Criado';
      eventDescription = `Um novo ticket foi criado${userName ? ` por ${userName}` : ''} e precisa de atenção.`;
      actionColor = '#10b981';
      break;
    case 'assigned':
      eventTitle = '👤 Ticket Atribuído';
      eventDescription = `Este ticket foi atribuído${userName ? ` por ${userName}` : ''}.`;
      actionColor = '#3b82f6';
      break;
    case 'updated':
      eventTitle = '📝 Ticket Atualizado';
      eventDescription = `O ticket foi atualizado${userName ? ` por ${userName}` : ''}.`;
      actionColor = '#f59e0b';
      break;
    case 'closed':
      eventTitle = '✅ Ticket Fechado';
      eventDescription = `Seu ticket foi resolvido e fechado${userName ? ` por ${userName}` : ''}.`;
      actionColor = '#10b981';
      break;
    case 'comment':
      eventTitle = '💬 Novo Comentário';
      eventDescription = `Um novo comentário foi adicionado${userName ? ` por ${userName}` : ''}.`;
      actionColor = '#8b5cf6';
      break;
    case 'reopened':
      eventTitle = '🔄 Ticket Reaberto';
      eventDescription = `O ticket foi reaberto${userName ? ` por ${userName}` : ''} para análise adicional.`;
      actionColor = '#f59e0b';
      break;
    case 'duplicated':
      eventTitle = '📋 Ticket Duplicado';
      eventDescription = `O ticket foi marcado como duplicado${userName ? ` por ${userName}` : ''}.`;
      actionColor = '#6b7280';
      break;
    default:
      eventTitle = '📧 Notificação do Ticket';
      eventDescription = message;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notificação HelpDesk</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, ${actionColor}20, ${actionColor}10); border-radius: 12px; padding: 32px; margin-bottom: 24px;">
            <h1 style="color: ${actionColor}; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">
                ${eventTitle}
            </h1>
            <div style="background: white; border-radius: 8px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h2 style="color: #1f2937; margin: 0 0 12px 0; font-size: 20px; font-weight: 600;">
                    ${ticketTitle}
                </h2>
                <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">
                    Ticket #${shortTicketId}
                </p>
                <p style="color: #4b5563; margin: 16px 0; font-size: 16px;">
                    ${eventDescription}
                </p>
                ${message && message !== eventDescription ? `
                <div style="background: #f9fafb; border-left: 4px solid ${actionColor}; padding: 16px; margin: 16px 0; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0; color: #374151; font-size: 15px;">
                        ${message}
                    </p>
                </div>
                ` : ''}
                <div style="margin-top: 24px;">
                    <a href="${ticketLink}" 
                       style="display: inline-block; background: ${actionColor}; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                        Ver Ticket Completo
                    </a>
                </div>
            </div>
        </div>
        
        <div style="text-align: center; color: #9ca3af; font-size: 14px; margin-top: 32px;">
            <p style="margin: 8px 0;">
                Esta é uma notificação automática do sistema HelpDesk.
            </p>
            <p style="margin: 8px 0;">
                Para gerenciar suas notificações, acesse as configurações do sistema.
            </p>
        </div>
    </body>
    </html>
  `;
}

serve(handler);