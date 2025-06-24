
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SupportNotificationRequest {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  request_type: string;
  created_at: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supportRequest: SupportNotificationRequest = await req.json();
    
    console.log("Processing support notification for:", supportRequest.id);

    // Determine the request type in Dutch
    const requestTypeMap: { [key: string]: string } = {
      'question': 'Algemene vraag',
      'technical_issue': 'Technisch probleem',
      'feature_request': 'Functie verzoek'
    };

    const requestTypeLabel = requestTypeMap[supportRequest.request_type] || supportRequest.request_type;

    // Send email notification to support team
    const emailResponse = await resend.emails.send({
      from: "Meester Support <noreply@meester.app>",
      to: ["hallo@meester.app"],
      subject: `Nieuw support verzoek: ${supportRequest.subject}`,
      html: `
        <h2>Nieuw Support Verzoek</h2>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Type:</strong> ${requestTypeLabel}</p>
          <p><strong>Van:</strong> ${supportRequest.name} (${supportRequest.email})</p>
          <p><strong>Onderwerp:</strong> ${supportRequest.subject}</p>
          <p><strong>Ontvangen op:</strong> ${new Date(supportRequest.created_at).toLocaleString('nl-NL')}</p>
        </div>
        
        <h3>Bericht:</h3>
        <div style="background: #fff; padding: 15px; border-left: 4px solid #007cba; margin: 15px 0;">
          ${supportRequest.message.replace(/\n/g, '<br>')}
        </div>
        
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          Support verzoek ID: ${supportRequest.id}<br>
          Dit bericht is automatisch gegenereerd door het Meester support systeem.
        </p>
      `,
    });

    console.log("Support notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-support-notification function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
