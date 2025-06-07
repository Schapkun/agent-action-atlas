

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationEmailRequest {
  email: string;
  organization_name: string;
  role: string;
  invited_by_name: string;
  signup_url: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Invitation email function called");

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

    const { email, organization_name, role, invited_by_name, signup_url }: InvitationEmailRequest = await req.json();

    console.log("Sending invitation email to:", email);

    const emailResponse = await resend.emails.send({
      from: "Uitnodigingen <hallo@meester.app>",
      to: [email],
      subject: `Uitnodiging voor ${organization_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; margin-bottom: 20px;">Je bent uitgenodigd!</h1>
          
          <p style="font-size: 16px; line-height: 1.5; color: #555;">
            Hallo,
          </p>
          
          <p style="font-size: 16px; line-height: 1.5; color: #555;">
            ${invited_by_name} heeft je uitgenodigd om lid te worden van <strong>${organization_name}</strong> 
            met de rol van <strong>${role}</strong>.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              <strong>Organisatie:</strong> ${organization_name}<br>
              <strong>Rol:</strong> ${role}<br>
              <strong>Uitgenodigd door:</strong> ${invited_by_name}
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.5; color: #555;">
            Klik op de onderstaande knop om je account aan te maken en de uitnodiging te accepteren:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${signup_url}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">
              Account Aanmaken
            </a>
          </div>
          
          <p style="font-size: 14px; color: #888; margin-top: 30px;">
            Als je geen account wilt aanmaken, kun je deze email negeren.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #aaa; text-align: center;">
            Deze uitnodiging is verzonden via Meester App.
          </p>
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
    console.error("Error in send-invitation-email function:", error);
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

