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

    // Fetch invoice lines
    const { data: invoiceLines } = await supabase
      .from('invoice_lines')
      .select('*')
      .eq('invoice_id', invoice.id)
      .order('sort_order', { ascending: true });

    // Fetch invoice template
    const { data: template } = await supabase
      .from('document_templates')
      .select('*')
      .eq('type', 'factuur')
      .eq('is_active', true)
      .limit(1)
      .single();

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

    // Generate proper PDF content using improved template
    const generateInvoicePDF = () => {
      console.log("Generating PDF content for invoice:", invoice.invoice_number);
      
      const htmlTemplate = template?.html_content || getDefaultInvoiceTemplate();
      
      // Generate invoice lines HTML with table-based layout for better PDF compatibility
      const invoiceLinesHtml = (invoiceLines || []).map(line => `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 12px; border-right: 1px solid #ddd; text-align: left;">${line.description}</td>
          <td style="padding: 12px; border-right: 1px solid #ddd; text-align: center;">${line.quantity}</td>
          <td style="padding: 12px; border-right: 1px solid #ddd; text-align: right;">€${line.unit_price.toFixed(2)}</td>
          <td style="padding: 12px; border-right: 1px solid #ddd; text-align: center;">${line.vat_rate}%</td>
          <td style="padding: 12px; text-align: right;">€${line.line_total.toFixed(2)}</td>
        </tr>
      `).join('');

      // Replace variables in template with improved styling
      const processedHtml = htmlTemplate
        .replace(/{{COMPANY_NAME}}/g, 'Uw Bedrijf')
        .replace(/{{COMPANY_ADDRESS}}/g, 'Bedrijfsadres')
        .replace(/{{COMPANY_POSTAL_CODE}}/g, '1234AB')
        .replace(/{{COMPANY_CITY}}/g, 'Stad')
        .replace(/{{COMPANY_PHONE}}/g, '+31 6 12345678')
        .replace(/{{COMPANY_EMAIL}}/g, 'info@uwbedrijf.nl')
        .replace(/{{COMPANY_KVK}}/g, '12345678')
        .replace(/{{COMPANY_VAT}}/g, 'NL123456789B01')
        .replace(/{{COMPANY_IBAN}}/g, 'NL91ABNA0417164300')
        .replace(/{{COMPANY_BIC}}/g, 'ABNANL2A')
        .replace(/{{INVOICE_NUMBER}}/g, invoice.invoice_number)
        .replace(/{{INVOICE_DATE}}/g, new Date(invoice.invoice_date).toLocaleDateString('nl-NL'))
        .replace(/{{DUE_DATE}}/g, new Date(invoice.due_date).toLocaleDateString('nl-NL'))
        .replace(/{{CUSTOMER_NAME}}/g, invoice.client_name)
        .replace(/{{CUSTOMER_ADDRESS}}/g, invoice.client_address || '')
        .replace(/{{CUSTOMER_POSTAL_CODE}}/g, invoice.client_postal_code || '')
        .replace(/{{CUSTOMER_CITY}}/g, invoice.client_city || '')
        .replace(/{{INVOICE_SUBJECT}}/g, invoice.notes || 'Factuur')
        .replace(/{{INVOICE_LINES}}/g, invoiceLinesHtml)
        .replace(/{{SUBTOTAL}}/g, invoice.subtotal.toFixed(2))
        .replace(/{{VAT_PERCENTAGE}}/g, invoice.vat_percentage.toString())
        .replace(/{{VAT_AMOUNT}}/g, invoice.vat_amount.toFixed(2))
        .replace(/{{TOTAL_AMOUNT}}/g, invoice.total_amount.toFixed(2))
        .replace(/{{PAYMENT_TERMS}}/g, (invoice.payment_terms || 30).toString());
      
      console.log("HTML template processed, length:", processedHtml.length);
      return processedHtml;
    };

    // Helper function for default template with improved PDF-compatible styling
    const getDefaultInvoiceTemplate = () => {
      return `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Factuur</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px;
            background: white; 
            color: #333;
            line-height: 1.4;
            width: 754px;
            min-height: 1063px;
        }
        .header { 
            width: 100%;
            margin-bottom: 40px; 
            border-bottom: 2px solid #3b82f6; 
            padding-bottom: 20px; 
        }
        .header table {
            width: 100%;
            border-collapse: collapse;
        }
        .company-info { 
            vertical-align: top;
            text-align: left;
        }
        .company-info h1 { 
            margin: 0 0 10px 0; 
            color: #3b82f6; 
            font-size: 24px; 
        }
        .company-info p { margin: 2px 0; }
        .invoice-info { 
            vertical-align: top;
            text-align: right; 
        }
        .invoice-number { 
            font-size: 24px; 
            font-weight: bold; 
            color: #3b82f6; 
            margin-bottom: 10px;
        }
        .customer-billing { 
            width: 100%;
            margin-bottom: 30px; 
        }
        .customer-billing table {
            width: 100%;
            border-collapse: collapse;
        }
        .customer-billing td {
            vertical-align: top;
            width: 50%;
            padding-right: 20px;
        }
        .section-title { 
            font-weight: bold; 
            margin-bottom: 10px; 
            color: #374151; 
            font-size: 14px;
        }
        .invoice-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
        }
        .invoice-table th, .invoice-table td { 
            border: 1px solid #d1d5db; 
            padding: 12px; 
            text-align: left; 
        }
        .invoice-table th { 
            background-color: #f3f4f6; 
            font-weight: bold; 
            font-size: 12px;
        }
        .invoice-table td { font-size: 11px; }
        .totals { 
            margin-top: 20px; 
            width: 100%;
        }
        .totals table {
            width: 300px;
            margin-left: auto;
            border-collapse: collapse;
        }
        .totals td {
            padding: 4px 0;
            text-align: right;
        }
        .totals .label {
            padding-right: 20px;
            font-weight: normal;
        }
        .totals .amount {
            font-weight: bold;
        }
        .final-total td { 
            font-size: 16px; 
            border-top: 2px solid #3b82f6; 
            padding-top: 8px; 
            font-weight: bold;
        }
        .footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #e5e7eb; 
            font-size: 11px; 
            color: #6b7280; 
        }
        .footer p { margin: 4px 0; }
    </style>
</head>
<body>
    <div class="header">
        <table>
            <tr>
                <td class="company-info">
                    <h1>{{COMPANY_NAME}}</h1>
                    <p>{{COMPANY_ADDRESS}}</p>
                    <p>{{COMPANY_POSTAL_CODE}} {{COMPANY_CITY}}</p>
                    <p>Tel: {{COMPANY_PHONE}}</p>
                    <p>Email: {{COMPANY_EMAIL}}</p>
                </td>
                <td class="invoice-info">
                    <div class="invoice-number">Factuur {{INVOICE_NUMBER}}</div>
                    <p><strong>Factuurdatum:</strong> {{INVOICE_DATE}}</p>
                    <p><strong>Vervaldatum:</strong> {{DUE_DATE}}</p>
                </td>
            </tr>
        </table>
    </div>

    <div class="customer-billing">
        <table>
            <tr>
                <td>
                    <div class="section-title">Factuuradres:</div>
                    <div>{{CUSTOMER_NAME}}</div>
                    <div>{{CUSTOMER_ADDRESS}}</div>
                    <div>{{CUSTOMER_POSTAL_CODE}} {{CUSTOMER_CITY}}</div>
                </td>
                <td>
                    <div class="section-title">Betreft:</div>
                    <div>{{INVOICE_SUBJECT}}</div>
                </td>
            </tr>
        </table>
    </div>

    <table class="invoice-table">
        <thead>
            <tr>
                <th>Omschrijving</th>
                <th>Aantal</th>
                <th>Prijs per stuk</th>
                <th>BTW %</th>
                <th>Totaal</th>
            </tr>
        </thead>
        <tbody>
            {{INVOICE_LINES}}
        </tbody>
    </table>

    <div class="totals">
        <table>
            <tr>
                <td class="label">Subtotaal:</td>
                <td class="amount">€ {{SUBTOTAL}}</td>
            </tr>
            <tr>
                <td class="label">BTW ({{VAT_PERCENTAGE}}%):</td>
                <td class="amount">€ {{VAT_AMOUNT}}</td>
            </tr>
            <tr class="final-total">
                <td class="label">Totaal:</td>
                <td class="amount">€ {{TOTAL_AMOUNT}}</td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <p>Betaling binnen {{PAYMENT_TERMS}} dagen na factuurdatum.</p>
        <p>{{COMPANY_NAME}} | KvK: {{COMPANY_KVK}} | BTW-nr: {{COMPANY_VAT}}</p>
        <p>IBAN: {{COMPANY_IBAN}} | BIC: {{COMPANY_BIC}}</p>
    </div>
</body>
</html>`;
    };

    const resend = new Resend(resendApiKey);

    console.log("Sending invoice email to:", invoice.client_email);
    console.log("Email type:", email_type);

    // Prepare email data
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
      // Only add HTML attachments for non-test emails
      ...(email_type !== 'test' && {
        attachments: [
          {
            filename: `factuur-${invoice.invoice_number}.html`,
            content: generateInvoicePDF(),
          }
        ]
      })
    };

    console.log("Email data prepared, sending...");

    const emailResponse = await resend.emails.send(emailData);

    console.log("Email response received:", emailResponse);

    // Check for errors in the response
    if (emailResponse.error) {
      console.error("Resend API error:", emailResponse.error);
      return new Response(
        JSON.stringify({ error: `Email sending failed: ${emailResponse.error.message}` }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Email sent successfully, ID:", emailResponse.data?.id);

    // Update invoice status to sent only for regular resend, not for reminders or tests
    if (email_type === 'resend' && invoice_id) {
      console.log("Updating invoice status to sent");
      const { error: updateError } = await supabase
        .from('invoices')
        .update({ status: 'sent', updated_at: new Date().toISOString() })
        .eq('id', invoice_id);

      if (updateError) {
        console.error('Error updating invoice status:', updateError);
      } else {
        console.log('Invoice status updated to sent');
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      message: "Email sent successfully" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invoice-email function:", error);
    console.error("Error stack:", error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Check function logs for more details"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
