
import html2pdf from 'html2pdf.js';
import { Invoice, InvoiceLine } from '@/hooks/useInvoices';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';

interface InvoicePDFData {
  invoice: Invoice;
  lines: InvoiceLine[];
  template?: DocumentTemplate;
  companyInfo?: {
    name?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    phone?: string;
    email?: string;
    kvk?: string;
    vat?: string;
    iban?: string;
    bic?: string;
    logo?: string;
  };
}

export class InvoicePDFGenerator {
  private static replaceVariables(html: string, data: InvoicePDFData): string {
    const { invoice, lines, companyInfo } = data;
    
    console.log('Replacing variables for invoice:', invoice.invoice_number);
    console.log('Invoice lines count:', lines.length);
    
    // Generate invoice lines HTML
    const invoiceLinesHtml = lines.map(line => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${line.description}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${line.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">€${line.unit_price.toFixed(2)}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${line.vat_rate}%</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">€${line.line_total.toFixed(2)}</td>
      </tr>
    `).join('');

    // Replace all variables in the HTML template
    const processedHtml = html
      .replace(/{{COMPANY_NAME}}/g, companyInfo?.name || 'Uw Bedrijf')
      .replace(/{{COMPANY_ADDRESS}}/g, companyInfo?.address || '')
      .replace(/{{COMPANY_POSTAL_CODE}}/g, companyInfo?.postalCode || '')
      .replace(/{{COMPANY_CITY}}/g, companyInfo?.city || '')
      .replace(/{{COMPANY_PHONE}}/g, companyInfo?.phone || '')
      .replace(/{{COMPANY_EMAIL}}/g, companyInfo?.email || '')
      .replace(/{{COMPANY_KVK}}/g, companyInfo?.kvk || '')
      .replace(/{{COMPANY_VAT}}/g, companyInfo?.vat || '')
      .replace(/{{COMPANY_IBAN}}/g, companyInfo?.iban || '')
      .replace(/{{COMPANY_BIC}}/g, companyInfo?.bic || '')
      .replace(/{{COMPANY_LOGO}}/g, companyInfo?.logo || '')
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

    console.log('Variables replaced successfully');
    return processedHtml;
  }

  static async generatePDF(data: InvoicePDFData, options: {
    format?: 'a4' | 'letter';
    orientation?: 'portrait' | 'landscape';
    filename?: string;
    download?: boolean;
    returnBlob?: boolean;
  } = {}): Promise<Blob | void> {
    const {
      format = 'a4',
      orientation = 'portrait',
      filename = `factuur-${data.invoice.invoice_number}.pdf`,
      download = true,
      returnBlob = false
    } = options;

    console.log('Generating PDF for invoice:', data.invoice.invoice_number);

    try {
      // Use template if provided, otherwise use default
      const htmlTemplate = data.template?.html_content || this.getDefaultTemplate();
      console.log('Using template with length:', htmlTemplate.length);
      
      // Replace variables with actual data
      const processedHtml = this.replaceVariables(htmlTemplate, data);

      // Configure html2pdf options
      const pdfOptions = {
        margin: 10,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'mm', 
          format: format,
          orientation: orientation
        }
      };

      console.log('PDF options configured:', pdfOptions);

      if (returnBlob) {
        console.log('Generating PDF blob...');
        const pdfBlob = await html2pdf()
          .set(pdfOptions)
          .from(processedHtml)
          .output('blob');
        console.log('PDF blob generated successfully');
        return pdfBlob;
      } else if (download) {
        console.log('Downloading PDF...');
        await html2pdf()
          .set(pdfOptions)
          .from(processedHtml)
          .save();
        console.log('PDF downloaded successfully');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }

  static async generatePreviewDataURL(data: InvoicePDFData): Promise<string> {
    console.log('Generating preview data URL for invoice:', data.invoice.invoice_number);
    
    try {
      const htmlTemplate = data.template?.html_content || this.getDefaultTemplate();
      const processedHtml = this.replaceVariables(htmlTemplate, data);

      console.log('Generating preview PDF...');
      const dataURL = await html2pdf()
        .set({
          margin: 10,
          image: { type: 'jpeg', quality: 0.8 },
          html2canvas: { 
            scale: 1, 
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(processedHtml)
        .output('datauristring');
      
      console.log('Preview data URL generated successfully');
      return dataURL;
    } catch (error) {
      console.error('Error generating preview:', error);
      throw new Error(`Preview generation failed: ${error.message}`);
    }
  }

  private static getDefaultTemplate(): string {
    return `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Factuur</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            background: white; 
            color: #333;
            line-height: 1.4;
        }
        .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start; 
            margin-bottom: 40px; 
            border-bottom: 2px solid #3b82f6; 
            padding-bottom: 20px; 
        }
        .company-info { flex: 1; }
        .company-info h1 { 
            margin: 0 0 10px 0; 
            color: #3b82f6; 
            font-size: 24px; 
        }
        .company-info p { margin: 2px 0; }
        .invoice-info { text-align: right; }
        .invoice-number { 
            font-size: 24px; 
            font-weight: bold; 
            color: #3b82f6; 
            margin-bottom: 10px;
        }
        .customer-billing { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 40px; 
            margin-bottom: 30px; 
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
            text-align: right; 
            max-width: 300px;
            margin-left: auto;
        }
        .total-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 8px; 
            padding: 4px 0;
        }
        .total-label { font-weight: normal; }
        .total-amount { font-weight: bold; }
        .final-total { 
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
        <div class="company-info">
            <h1>{{COMPANY_NAME}}</h1>
            <p>{{COMPANY_ADDRESS}}</p>
            <p>{{COMPANY_POSTAL_CODE}} {{COMPANY_CITY}}</p>
            <p>Tel: {{COMPANY_PHONE}}</p>
            <p>Email: {{COMPANY_EMAIL}}</p>
        </div>
        <div class="invoice-info">
            <div class="invoice-number">Factuur {{INVOICE_NUMBER}}</div>
            <p><strong>Factuurdatum:</strong> {{INVOICE_DATE}}</p>
            <p><strong>Vervaldatum:</strong> {{DUE_DATE}}</p>
        </div>
    </div>

    <div class="customer-billing">
        <div>
            <div class="section-title">Factuuradres:</div>
            <div>{{CUSTOMER_NAME}}</div>
            <div>{{CUSTOMER_ADDRESS}}</div>
            <div>{{CUSTOMER_POSTAL_CODE}} {{CUSTOMER_CITY}}</div>
        </div>
        <div>
            <div class="section-title">Betreft:</div>
            <div>{{INVOICE_SUBJECT}}</div>
        </div>
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
        <div class="total-row">
            <div class="total-label">Subtotaal:</div>
            <div class="total-amount">€ {{SUBTOTAL}}</div>
        </div>
        <div class="total-row">
            <div class="total-label">BTW ({{VAT_PERCENTAGE}}%):</div>
            <div class="total-amount">€ {{VAT_AMOUNT}}</div>
        </div>
        <div class="total-row final-total">
            <div class="total-label">Totaal:</div>
            <div class="total-amount">€ {{TOTAL_AMOUNT}}</div>
        </div>
    </div>

    <div class="footer">
        <p>Betaling binnen {{PAYMENT_TERMS}} dagen na factuurdatum.</p>
        <p>{{COMPANY_NAME}} | KvK: {{COMPANY_KVK}} | BTW-nr: {{COMPANY_VAT}}</p>
        <p>IBAN: {{COMPANY_IBAN}} | BIC: {{COMPANY_BIC}}</p>
    </div>
</body>
</html>`;
  }
}
