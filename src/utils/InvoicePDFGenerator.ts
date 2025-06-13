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
    
    // Generate invoice lines HTML
    const invoiceLinesHtml = lines.map(line => `
      <tr>
        <td>${line.description}</td>
        <td>${line.quantity}</td>
        <td>€${line.unit_price.toFixed(2)}</td>
        <td>${line.vat_rate}%</td>
        <td>€${line.line_total.toFixed(2)}</td>
      </tr>
    `).join('');

    // Replace all variables in the HTML template
    return html
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

    // Use template if provided, otherwise use default
    const htmlTemplate = data.template?.html_content || this.getDefaultTemplate();
    
    // Replace variables with actual data
    const processedHtml = this.replaceVariables(htmlTemplate, data);

    // Create a temporary container for rendering
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = processedHtml;
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '210mm'; // A4 width
    document.body.appendChild(tempContainer);

    try {
      // Configure html2pdf options
      const pdfOptions = {
        margin: 10,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false
        },
        jsPDF: { 
          unit: 'mm', 
          format: format,
          orientation: orientation
        }
      };

      if (returnBlob) {
        const pdfBlob = await html2pdf()
          .set(pdfOptions)
          .from(tempContainer)
          .output('blob');
        return pdfBlob;
      } else if (download) {
        await html2pdf()
          .set(pdfOptions)
          .from(tempContainer)
          .save();
      }
    } finally {
      // Clean up temporary container
      document.body.removeChild(tempContainer);
    }
  }

  static async generatePreviewDataURL(data: InvoicePDFData): Promise<string> {
    const htmlTemplate = data.template?.html_content || this.getDefaultTemplate();
    const processedHtml = this.replaceVariables(htmlTemplate, data);

    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = processedHtml;
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '210mm';
    document.body.appendChild(tempContainer);

    try {
      const dataURL = await html2pdf()
        .set({
          margin: 10,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 1, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(tempContainer)
        .output('datauristring');
      
      return dataURL;
    } finally {
      document.body.removeChild(tempContainer);
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
        body { font-family: Arial, sans-serif; margin: 20px; background: white; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
        .company-info { flex: 1; }
        .company-logo { width: 120px; height: auto; }
        .invoice-info { text-align: right; }
        .invoice-number { font-size: 24px; font-weight: bold; color: #3b82f6; }
        .customer-billing { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
        .section-title { font-weight: bold; margin-bottom: 10px; color: #374151; }
        .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .invoice-table th, .invoice-table td { border: 1px solid #d1d5db; padding: 12px; text-align: left; }
        .invoice-table th { background-color: #f3f4f6; font-weight: bold; }
        .totals { margin-top: 20px; text-align: right; }
        .total-row { display: flex; justify-content: flex-end; margin-bottom: 8px; }
        .total-label { width: 150px; text-align: right; margin-right: 20px; }
        .total-amount { width: 100px; text-align: right; font-weight: bold; }
        .final-total { font-size: 18px; border-top: 2px solid #3b82f6; padding-top: 8px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
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
