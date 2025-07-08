
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SupportNotificationRequest {
  id: string;
  contact_name: string;
  contact_email: string;
  subject: string;
  description: string;
  request_type: string;
  created_at: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Support notification function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    console.log("RESEND_API_KEY exists:", !!resendApiKey);
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not set in environment variables");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const resend = new Resend(resendApiKey);

    const { id, contact_name, contact_email, subject, description, request_type, created_at }: SupportNotificationRequest = await req.json();

    console.log("Sending support notification email for request:", id);

    const getRequestTypeLabel = (type: string) => {
      switch (type) {
        case 'question': return 'Algemene Vraag';
        case 'technical_issue': return 'Technisch Probleem';
        case 'feature_request': return 'Functie Verzoek';
        default: return type;
      }
    };

    const getRequestTypeColor = (type: string) => {
      switch (type) {
        case 'question': return '#3b82f6';
        case 'technical_issue': return '#ef4444';
        case 'feature_request': return '#10b981';
        default: return '#6b7280';
      }
    };

    const emailResponse = await resend.emails.send({
      from: "Support <hallo@meester.app>",
      to: ["hallo@meester.app"],
      subject: `[${getRequestTypeLabel(request_type)}] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #1f2937; margin-bottom: 20px; font-size: 24px;">Nieuwe Support Request</h1>
            
            <div style="background-color: ${getRequestTypeColor(request_type)}; color: white; padding: 8px 16px; border-radius: 6px; display: inline-block; margin-bottom: 20px; font-weight: bold; font-size: 14px;">
              ${getRequestTypeLabel(request_type)}
            </div>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
              <h2 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">Request Details</h2>
              <p style="margin: 5px 0; color: #6b7280;"><strong>ID:</strong> ${id}</p>
              <p style="margin: 5px 0; color: #6b7280;"><strong>Datum:</strong> ${new Date(created_at).toLocaleString('nl-NL')}</p>
              <p style="margin: 5px 0; color: #6b7280;"><strong>Onderwerp:</strong> ${subject}</p>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
              <h2 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">Contact Informatie</h2>
              <p style="margin: 5px 0; color: #6b7280;"><strong>Naam:</strong> ${contact_name}</p>
              <p style="margin: 5px 0; color: #6b7280;"><strong>Email:</strong> <a href="mailto:${contact_email}" style="color: #3b82f6;">${contact_email}</a></p>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
              <h2 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">Bericht</h2>
              <div style="background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid ${getRequestTypeColor(request_type)};">
                <p style="margin: 0; color: #374151; line-height: 1.6; white-space: pre-wrap;">${description}</p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="mailto:${contact_email}?subject=Re: ${subject}" 
                 style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Beantwoord Direct
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
            Deze notificatie is automatisch gegenereerd via Meester App Support
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-support-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
