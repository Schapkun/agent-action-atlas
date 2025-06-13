
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
    console.log('Company info available:', !!companyInfo);
    
    // Generate invoice lines HTML with table-based layout for PDF compatibility
    const invoiceLinesHtml = lines.map(line => `
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 12px; border-right: 1px solid #ddd; text-align: left;">${line.description}</td>
        <td style="padding: 12px; border-right: 1px solid #ddd; text-align: center;">${line.quantity}</td>
        <td style="padding: 12px; border-right: 1px solid #ddd; text-align: right;">€${line.unit_price.toFixed(2)}</td>
        <td style="padding: 12px; border-right: 1px solid #ddd; text-align: center;">${line.vat_rate}%</td>
        <td style="padding: 12px; text-align: right;">€${line.line_total.toFixed(2)}</td>
      </tr>
    `).join('');

    // Replace all variables in the HTML template - remove any image references
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
      .replace(/{{COMPANY_LOGO}}/g, '') // Remove logo to prevent loading issues
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

  private static async createHTMLContainer(htmlContent: string): Promise<HTMLElement> {
    console.log('Creating HTML container for rendering');
    
    try {
      const container = document.createElement('div');
      container.innerHTML = htmlContent;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = '794px'; // A4 width
      container.style.backgroundColor = 'white';
      container.style.fontFamily = 'Arial, sans-serif';
      container.style.fontSize = '12px';
      container.style.lineHeight = '1.4';
      container.style.boxSizing = 'border-box';
      container.style.overflow = 'hidden';
      
      // Remove any img elements to prevent loading errors
      const images = container.querySelectorAll('img');
      images.forEach(img => img.remove());
      
      document.body.appendChild(container);
      
      // Wait for fonts to load
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('HTML container ready');
      return container;
    } catch (error) {
      console.error('Error creating HTML container:', error);
      throw new Error(`Failed to create HTML container: ${error.message}`);
    }
  }

  private static getValidTemplate(data: InvoicePDFData): string {
    console.log('Getting template...');
    
    if (data.template?.html_content && data.template.html_content.trim().length > 0) {
      console.log('Using provided template');
      return data.template.html_content;
    }
    
    console.log('Using default template');
    return this.getDefaultTemplate();
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

    console.log('🚀 Starting PDF generation for invoice:', data.invoice.invoice_number);

    try {
      const htmlTemplate = this.getValidTemplate(data);
      console.log('✅ Template obtained');
      
      const processedHtml = this.replaceVariables(htmlTemplate, data);
      console.log('✅ Variables replaced');
      
      const container = await this.createHTMLContainer(processedHtml);
      console.log('✅ HTML container created');
      
      console.log('🎨 Starting canvas rendering...');
      
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        logging: false,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          // Remove any problematic elements in the cloned document
          const images = clonedDoc.querySelectorAll('img');
          images.forEach(img => img.remove());
        }
      });
      
      console.log('✅ Canvas generated');
      
      document.body.removeChild(container);
      console.log('✅ Container cleaned up');
      
      const imgData = canvas.toDataURL('image/png');
      if (!imgData || imgData.length < 1000) {
        throw new Error('Canvas generated invalid image data');
      }
      console.log('✅ Canvas data validated');
      
      console.log('📄 Creating PDF document...');
      
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'px',
        format: [794, 1123]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, 794, 1123);
      console.log('✅ PDF created successfully');

      if (returnBlob) {
        console.log('📤 Returning PDF as blob...');
        const pdfBlob = pdf.output('blob');
        return pdfBlob;
      } else if (download) {
        console.log('💾 Downloading PDF...');
        pdf.save(filename);
      }
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }

  static async generatePreviewDataURL(data: InvoicePDFData): Promise<string> {
    console.log('🔍 Starting PDF preview generation (Data URI) for invoice:', data.invoice.invoice_number);
    
    try {
      const htmlTemplate = this.getValidTemplate(data);
      const processedHtml = this.replaceVariables(htmlTemplate, data);
      const container = await this.createHTMLContainer(processedHtml);
      
      console.log('🎨 Generating canvas for preview...');
      
      const canvas = await html2canvas(container, {
        scale: 1.5, // Slightly lower scale for preview
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        logging: false,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          const images = clonedDoc.querySelectorAll('img');
          images.forEach(img => img.remove());
        }
      });
      
      document.body.removeChild(container);
      
      const imgData = canvas.toDataURL('image/png');
      
      console.log('📄 Creating PDF for preview...');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [794, 1123]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, 794, 1123);
      
      // Generate data URI instead of blob URL
      const dataUri = pdf.output('datauristring');
      
      console.log('✅ Preview data URI generated successfully');
      return dataUri;
      
    } catch (error) {
      console.error('❌ Preview generation failed:', error);
      
      // Fallback to simple preview
      try {
        console.log('🔄 Attempting fallback preview...');
        return await this.generateFallbackPreview(data);
      } catch (fallbackError) {
        console.error('❌ Fallback preview also failed:', fallbackError);
        throw new Error(`Preview generation failed: ${error.message}`);
      }
    }
  }

  private static async generateFallbackPreview(data: InvoicePDFData): Promise<string> {
    console.log('📄 Generating minimal fallback preview...');
    
    const fallbackTemplate = this.getMinimalTemplate();
    const processedHtml = this.replaceVariables(fallbackTemplate, data);
    
    const container = await this.createHTMLContainer(processedHtml);
    
    const canvas = await html2canvas(container, {
      scale: 1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794,
      height: 400,
      logging: false,
      imageTimeout: 0
    });
    
    document.body.removeChild(container);
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [794, 400]
    });
    
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 794, 400);
    
    const fallbackDataUri = pdf.output('datauristring');
    console.log('✅ Fallback preview generated');
    return fallbackDataUri;
  }

  // Unified template with consistent 794px width
  private static getDefaultTemplate(): string {
    return `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Factuur</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body { 
            font-family: Arial, sans-serif; 
            margin: 30px;
            padding: 0;
            background: white; 
            color: #333;
            line-height: 1.4;
            width: 734px;
            min-height: 1063px;
            font-size: 12px;
        }
        .header { 
            width: 100%;
            margin-bottom: 30px; 
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
            font-size: 20px; 
        }
        .company-info p { margin: 2px 0; font-size: 11px; }
        .invoice-info { 
            vertical-align: top;
            text-align: right; 
        }
        .invoice-number { 
            font-size: 20px; 
            font-weight: bold; 
            color: #3b82f6; 
            margin-bottom: 10px;
        }
        .customer-billing { 
            width: 100%;
            margin-bottom: 25px; 
        }
        .customer-billing table {
            width: 100%;
            border-collapse: collapse;
        }
        .customer-billing td {
            vertical-align: top;
            width: 50%;
            padding-right: 15px;
        }
        .section-title { 
            font-weight: bold; 
            margin-bottom: 8px; 
            color: #374151; 
            font-size: 12px;
        }
        .invoice-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
        }
        .invoice-table th, .invoice-table td { 
            border: 1px solid #d1d5db; 
            padding: 10px; 
            text-align: left; 
        }
        .invoice-table th { 
            background-color: #f3f4f6; 
            font-weight: bold; 
            font-size: 11px;
        }
        .invoice-table td { font-size: 10px; }
        .totals { 
            margin-top: 20px; 
            width: 100%;
        }
        .totals table {
            width: 250px;
            margin-left: auto;
            border-collapse: collapse;
        }
        .totals td {
            padding: 4px 0;
            text-align: right;
            font-size: 11px;
        }
        .totals .label {
            padding-right: 15px;
            font-weight: normal;
        }
        .totals .amount {
            font-weight: bold;
        }
        .final-total td { 
            font-size: 13px; 
            border-top: 2px solid #3b82f6; 
            padding-top: 6px; 
            font-weight: bold;
        }
        .footer { 
            margin-top: 30px; 
            padding-top: 15px; 
            border-top: 1px solid #e5e7eb; 
            font-size: 10px; 
            color: #6b7280; 
        }
        .footer p { margin: 3px 0; }
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
  }

  // Minimal template for fallback scenarios
  private static getMinimalTemplate(): string {
    return `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; width: 754px; background: white; }
        .header { border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 20px; }
        .title { font-size: 18px; color: #3b82f6; font-weight: bold; }
        .content { font-size: 12px; line-height: 1.4; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Factuur {{INVOICE_NUMBER}}</div>
        <div>{{COMPANY_NAME}}</div>
    </div>
    <div class="content">
        <p><strong>Klant:</strong> {{CUSTOMER_NAME}}</p>
        <p><strong>Datum:</strong> {{INVOICE_DATE}}</p>
        <p><strong>Totaal:</strong> €{{TOTAL_AMOUNT}}</p>
    </div>
</body>
</html>`;
  }
}
