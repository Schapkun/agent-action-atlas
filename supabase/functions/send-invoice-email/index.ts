
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceEmailRequest {
  invoice_id: string;
  email_template: {
    subject: string;
    message: string;
  };
  email_type?: 'resend' | 'reminder' | 'test';
  mock_invoice?: any;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Invoice email function called");

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

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { invoice_id, email_template, email_type = 'resend', mock_invoice }: InvoiceEmailRequest = await req.json();

    let invoice;

    // For test emails, use the mock invoice data
    if (email_type === 'test' && mock_invoice) {
      console.log("Using mock invoice data for test email");
      invoice = mock_invoice;
    } else {
      // Fetch invoice details for real emails
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoice_id)
        .single();

      if (invoiceError || !invoiceData) {
        console.error('Error fetching invoice:', invoiceError);
        return new Response(
          JSON.stringify({ error: "Invoice not found" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      invoice = invoiceData;
    }

    if (!invoice.client_email) {
      return new Response(
        JSON.stringify({ error: "Client email not provided" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Replace variables in email template
    const replaceVariables = (text: string) => {
      return text
        .replace(/{invoice_number}/g, invoice.invoice_number)
        .replace(/{client_name}/g, invoice.client_name)
        .replace(/{total_amount}/g, invoice.total_amount.toFixed(2))
        .replace(/{due_date}/g, new Date(invoice.due_date).toLocaleDateString('nl-NL'))
        .replace(/{invoice_date}/g, new Date(invoice.invoice_date).toLocaleDateString('nl-NL'));
    };

    const finalSubject = replaceVariables(email_template.subject);
    const finalMessage = replaceVariables(email_template.message);

    // Generate PDF content for attachment using Deno-compatible approach
    const generateInvoicePDF = () => {
      // Simple text-based PDF content (in a real implementation you'd use a proper PDF library)
      const pdfContent = `
FACTUUR ${invoice.invoice_number}

Factuurdatum: ${new Date(invoice.invoice_date).toLocaleDateString('nl-NL')}
Vervaldatum: ${new Date(invoice.due_date).toLocaleDateString('nl-NL')}

FACTUURADRES:
${invoice.client_name}
${invoice.client_address || ''}
${invoice.client_postal_code ? `${invoice.client_postal_code} ${invoice.client_city}` : ''}
${invoice.client_country || ''}

BEDRAGEN:
Subtotaal: €${invoice.subtotal.toFixed(2)}
BTW (${invoice.vat_percentage}%): €${invoice.vat_amount.toFixed(2)}
Totaal: €${invoice.total_amount.toFixed(2)}

${invoice.notes ? `\nOpmerkingen:\n${invoice.notes}` : ''}
      `.trim();
      
      // Use TextEncoder instead of Buffer for Deno compatibility
      return new TextEncoder().encode(pdfContent);
    };

    const resend = new Resend(resendApiKey);

    console.log("Sending invoice email to:", invoice.client_email);

    // Prepare email with PDF attachment
    const emailData = {
      from: "Facturen <facturen@meester.app>",
      to: [invoice.client_email],
      subject: email_type === 'test' ? `[TEST] ${finalSubject}` : finalSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          ${email_type === 'test' ? '<div style="background-color: #fef3cd; padding: 10px; margin-bottom: 20px; border: 1px solid #ffeaa7; border-radius: 4px;"><strong>Dit is een test email</strong></div>' : ''}
          
          <h1 style="color: #333; margin-bottom: 20px;">Factuur ${invoice.invoice_number}</h1>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              <strong>Factuur:</strong> ${invoice.invoice_number}<br>
              <strong>Datum:</strong> ${new Date(invoice.invoice_date).toLocaleDateString('nl-NL')}<br>
              <strong>Vervaldatum:</strong> ${new Date(invoice.due_date).toLocaleDateString('nl-NL')}<br>
              <strong>Totaalbedrag:</strong> €${invoice.total_amount.toFixed(2)}
            </p>
          </div>
          
          <div style="white-space: pre-wrap; font-size: 16px; line-height: 1.5; color: #555;">
            ${finalMessage}
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #aaa; text-align: center;">
            Deze factuur is verzonden via Meester App.
          </p>
        </div>
      `,
      attachments: email_type === 'test' ? [] : [
        {
          filename: `factuur-${invoice.invoice_number}.txt`,
          content: generateInvoicePDF(),
        }
      ]
    };

    const emailResponse = await resend.emails.send(emailData);

    console.log("Email sent successfully:", emailResponse);

    // Update invoice status to sent only for regular resend, not for reminders or tests
    if (email_type === 'resend') {
      const { error: updateError } = await supabase
        .from('invoices')
        .update({ status: 'sent', updated_at: new Date().toISOString() })
        .eq('id', invoice_id);

      if (updateError) {
        console.error('Error updating invoice status:', updateError);
      }
    }

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invoice-email function:", error);
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
