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
  private static readonly MAX_DATA_URI_SIZE = 1.5 * 1024 * 1024; // 1.5MB limit
  private static readonly PREVIEW_SCALE = 1.0; // Full scale for better quality
  private static readonly JPEG_QUALITY = 0.85; // Higher quality for better readability

  private static replaceVariables(html: string, data: InvoicePDFData): string {
    const { invoice, lines, companyInfo } = data;
    
    console.log('Replacing variables for invoice:', invoice.invoice_number);
    console.log('Invoice lines count:', lines.length);
    console.log('Company info available:', !!companyInfo);
    
    const invoiceLinesHtml = lines.map(line => `
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 8px; border-right: 1px solid #ddd; text-align: left;">${line.description}</td>
        <td style="padding: 8px; border-right: 1px solid #ddd; text-align: center;">${line.quantity}</td>
        <td style="padding: 8px; border-right: 1px solid #ddd; text-align: right;">€${line.unit_price.toFixed(2)}</td>
        <td style="padding: 8px; border-right: 1px solid #ddd; text-align: center;">${line.vat_rate}%</td>
        <td style="padding: 8px; text-align: right;">€${line.line_total.toFixed(2)}</td>
      </tr>
    `).join('');

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
      .replace(/{{COMPANY_LOGO}}/g, '')
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

  private static checkCanvasSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      return !!(ctx && canvas);
    } catch (error) {
      console.error('Canvas not supported:', error);
      return false;
    }
  }

  private static async createHTMLContainer(htmlContent: string, isPreview: boolean = false): Promise<HTMLElement> {
    console.log('Creating HTML container for rendering (preview mode:', isPreview, ')');
    
    try {
      const container = document.createElement('div');
      container.innerHTML = htmlContent;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = isPreview ? '1200px' : '794px'; // Larger for preview
      container.style.backgroundColor = 'white';
      container.style.fontFamily = 'Arial, sans-serif';
      container.style.fontSize = isPreview ? '18px' : '12px'; // Larger for preview
      container.style.lineHeight = '1.3';
      container.style.boxSizing = 'border-box';
      container.style.overflow = 'hidden';
      container.style.zIndex = '-1000';
      
      // Remove any problematic elements
      const images = container.querySelectorAll('img');
      images.forEach(img => img.remove());
      
      const scripts = container.querySelectorAll('script');
      scripts.forEach(script => script.remove());
      
      document.body.appendChild(container);
      
      // DOM stabilization delay
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
      
      const container = await this.createHTMLContainer(processedHtml, false);
      console.log('✅ HTML container created');
      
      console.log('🎨 Starting canvas rendering...');
      
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: false,
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
    console.log('🔍 Starting definitive canvas preview generation for invoice:', data.invoice.invoice_number);
    
    // Check canvas support first
    if (!this.checkCanvasSupport()) {
      console.log('❌ Canvas not supported, falling back to text preview');
      throw new Error('Canvas not supported in this browser');
    }
    
    try {
      console.log('📝 Attempting to generate full PDF preview...');
      
      // First try to generate full PDF preview
      const pdfBlob = await this.generatePDF(data, {
        download: false,
        returnBlob: true
      });
      
      if (pdfBlob) {
        const dataUrl = await this.blobToDataURL(pdfBlob);
        const sizeInBytes = dataUrl.length * 0.75; // Approximate size
        console.log('📊 PDF size:', Math.round(sizeInBytes / 1024), 'KB');
        
        if (sizeInBytes <= this.MAX_DATA_URI_SIZE) {
          console.log('✅ PDF preview size acceptable, returning PDF data URI');
          return dataUrl;
        } else {
          console.log('⚠️ PDF too large for preview (', Math.round(sizeInBytes / 1024), 'KB ), falling back to canvas preview');
        }
      }
    } catch (error) {
      console.log('⚠️ PDF generation failed, falling back to canvas preview:', error.message);
    }
    
    // Fallback to high-quality canvas preview
    try {
      console.log('🖼️ Generating high-quality canvas preview...');
      return await this.generateCanvasPreview(data);
    } catch (error) {
      console.error('❌ Canvas preview failed:', error);
      throw new Error(`Preview generation failed: ${error.message}`);
    }
  }

  private static async generateCanvasPreview(data: InvoicePDFData): Promise<string> {
    console.log('🎨 Creating high-quality canvas preview...');
    
    const htmlTemplate = this.getMinimalTemplate();
    const processedHtml = this.replaceVariables(htmlTemplate, data);
    
    let container: HTMLElement | null = null;
    
    try {
      container = await this.createHTMLContainer(processedHtml, true);
      
      // Use high-quality canvas configuration
      const canvas = await html2canvas(container, {
        scale: this.PREVIEW_SCALE,
        backgroundColor: '#ffffff',
        width: 1200,
        height: 800,
        logging: false,
        useCORS: false,
        allowTaint: false,
        removeContainer: false,
        imageTimeout: 0
      });
      
      console.log('✅ High-quality canvas rendered successfully');
      
      // Generate high-quality image data
      const canvasDataUri = canvas.toDataURL('image/jpeg', this.JPEG_QUALITY);
      const sizeInBytes = canvasDataUri.length * 0.75;
      console.log('📊 Canvas preview size:', Math.round(sizeInBytes / 1024), 'KB');
      
      return canvasDataUri;
      
    } catch (error) {
      console.error('❌ Canvas rendering failed:', error);
      throw error;
    } finally {
      if (container && container.parentNode) {
        document.body.removeChild(container);
        console.log('✅ Container cleaned up');
      }
    }
  }

  private static async blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
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
            margin: 25px;
            padding: 0;
            background: white; 
            color: #333;
            line-height: 1.3;
            width: 744px;
            min-height: 1073px;
            font-size: 11px;
        }
        .header { 
            width: 100%;
            margin-bottom: 25px; 
            border-bottom: 2px solid #3b82f6; 
            padding-bottom: 15px; 
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
            margin: 0 0 8px 0; 
            color: #3b82f6; 
            font-size: 18px; 
        }
        .company-info p { margin: 1px 0; font-size: 10px; }
        .invoice-info { 
            vertical-align: top;
            text-align: right; 
        }
        .invoice-number { 
            font-size: 18px; 
            font-weight: bold; 
            color: #3b82f6; 
            margin-bottom: 8px;
        }
        .customer-billing { 
            width: 100%;
            margin-bottom: 20px; 
        }
        .customer-billing table {
            width: 100%;
            border-collapse: collapse;
        }
        .customer-billing td {
            vertical-align: top;
            width: 50%;
            padding-right: 10px;
        }
        .section-title { 
            font-weight: bold; 
            margin-bottom: 6px; 
            color: #374151; 
            font-size: 11px;
        }
        .invoice-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0; 
        }
        .invoice-table th, .invoice-table td { 
            border: 1px solid #d1d5db; 
            padding: 6px; 
            text-align: left; 
        }
        .invoice-table th { 
            background-color: #f3f4f6; 
            font-weight: bold; 
            font-size: 10px;
        }
        .invoice-table td { font-size: 9px; }
        .totals { 
            margin-top: 15px; 
            width: 100%;
        }
        .totals table {
            width: 200px;
            margin-left: auto;
            border-collapse: collapse;
        }
        .totals td {
            padding: 3px 0;
            text-align: right;
            font-size: 10px;
        }
        .totals .label {
            padding-right: 10px;
            font-weight: normal;
        }
        .totals .amount {
            font-weight: bold;
        }
        .final-total td { 
            font-size: 11px; 
            border-top: 2px solid #3b82f6; 
            padding-top: 4px; 
            font-weight: bold;
        }
        .footer { 
            margin-top: 20px; 
            padding-top: 10px; 
            border-top: 1px solid #e5e7eb; 
            font-size: 9px; 
            color: #6b7280; 
        }
        .footer p { margin: 2px 0; }
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

  // Enhanced minimal template with larger fonts for better readability
  private static getMinimalTemplate(): string {
    return `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            width: 1160px; 
            background: white; 
            font-size: 18px; 
            line-height: 1.4;
        }
        .header { 
            border-bottom: 3px solid #3b82f6; 
            padding-bottom: 16px; 
            margin-bottom: 24px; 
        }
        .title { 
            font-size: 24px; 
            color: #3b82f6; 
            font-weight: bold; 
            margin-bottom: 8px; 
        }
        .content { 
            font-size: 16px; 
            line-height: 1.5; 
        }
        .info-row { 
            display: flex; 
            justify-content: space-between; 
            margin: 8px 0; 
        }
        .info-col {
            width: 48%;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
            font-size: 14px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background: #f5f5f5;
            font-weight: bold;
        }
        .total {
            text-align: right;
            margin-top: 16px;
            font-weight: bold;
            font-size: 18px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Factuur {{INVOICE_NUMBER}}</div>
        <div style="font-size: 16px;">{{COMPANY_NAME}}</div>
    </div>
    <div class="content">
        <div class="info-row">
            <div class="info-col">
                <p><strong>Klant:</strong> {{CUSTOMER_NAME}}</p>
                <p><strong>Datum:</strong> {{INVOICE_DATE}}</p>
            </div>
            <div class="info-col">
                <p><strong>Vervaldatum:</strong> {{DUE_DATE}}</p>
                <p><strong>Betreft:</strong> {{INVOICE_SUBJECT}}</p>
            </div>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Beschrijving</th>
                    <th>Aantal</th>
                    <th>Prijs</th>
                    <th>Totaal</th>
                </tr>
            </thead>
            <tbody>
                {{INVOICE_LINES}}
            </tbody>
        </table>
        
        <div class="total">
            <p>Subtotaal: €{{SUBTOTAL}}</p>
            <p>BTW: €{{VAT_AMOUNT}}</p>
            <p><strong>Totaal: €{{TOTAL_AMOUNT}}</strong></p>
        </div>
    </div>
</body>
</html>`;
  }
}
