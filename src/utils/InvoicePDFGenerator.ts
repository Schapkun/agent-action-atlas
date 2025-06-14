
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
        <td style="padding: 12px; border-right: 1px solid #ddd; text-align: left;">${line.description}</td>
        <td style="padding: 12px; border-right: 1px solid #ddd; text-align: center;">${line.quantity}</td>
        <td style="padding: 12px; border-right: 1px solid #ddd; text-align: right;">€${line.unit_price.toFixed(2)}</td>
        <td style="padding: 12px; text-align: right;">€${line.line_total.toFixed(2)}</td>
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

      // Explicitly add margin/padding around the "PDF page"
      // Assume the rendered template uses a fixed width for a "page" (A4: 794px wide at 96dpi)
      // Add 36px (1.27cm) margin & 20px padding (or according to template) around, like browser preview
      container.style.width = isPreview ? '1200px' : '834px'; // 794px + 2*20px padding
      container.style.backgroundColor = 'white';
      container.style.fontFamily = 'Arial, sans-serif';
      container.style.fontSize = isPreview ? '18px' : '16px';
      container.style.lineHeight = '1.4';
      container.style.boxSizing = 'border-box';
      container.style.overflow = 'hidden';
      container.style.zIndex = '-1000';
      container.style.margin = '36px'; // ~1.27cm (A4 default)
      container.style.padding = '20px'; // Mooie rand (past bij template)

      // Zorg ook dat <body> in de template geen margin/padding overschrijft
      const innerBody = container.querySelector('body');
      if (innerBody) {
        innerBody.style.margin = '0';
        innerBody.style.padding = '0';
      }
      
      // Remove any problematic elements
      const images = container.querySelectorAll('img');
      images.forEach(img => img.remove());

      const scripts = container.querySelectorAll('script');
      scripts.forEach(script => script.remove());

      document.body.appendChild(container);
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
    
    // ALWAYS use the unified template for consistency
    console.log('Using unified template for both preview and download');
    return this.getUnifiedTemplate();
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
    
    const htmlTemplate = this.getUnifiedTemplate(); // Use same template
    const processedHtml = this.replaceVariables(htmlTemplate, data);
    
    let container: HTMLElement | null = null;
    
    try {
      container = await this.createHTMLContainer(processedHtml, true);
      
      // Use high-quality canvas configuration with increased dimensions
      const canvas = await html2canvas(container, {
        scale: this.PREVIEW_SCALE,
        backgroundColor: '#ffffff',
        width: 1200, // Increased from 600
        height: 800, // Increased from 400
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

  // UNIFIED template - used for BOTH preview and download to ensure consistency
  private static getUnifiedTemplate(): string {
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
            color: #333;
        }
        .header { 
            border-bottom: 3px solid #3b82f6; 
            padding-bottom: 16px; 
            margin-bottom: 24px; 
        }
        .title { 
            font-size: 28px; 
            color: #3b82f6; 
            font-weight: bold; 
            margin-bottom: 8px; 
        }
        .company-name {
            font-size: 20px;
            color: #3b82f6;
            font-weight: bold;
            margin-bottom: 6px;
        }
        .company-details {
            font-size: 14px;
            color: #666;
            line-height: 1.3;
        }
        .content { 
            font-size: 18px; 
            line-height: 1.5; 
        }
        .info-section {
            display: flex;
            justify-content: space-between;
            margin: 16px 0;
        }
        .info-col {
            width: 48%;
        }
        .info-label {
            font-weight: bold;
            font-size: 16px;
            color: #374151;
            margin-bottom: 4px;
        }
        .info-value {
            font-size: 16px;
            margin-bottom: 8px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 16px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background: #f5f5f5;
            font-weight: bold;
            font-size: 16px;
        }
        .totals {
            margin-top: 20px;
            text-align: right;
        }
        .total-row {
            font-size: 18px;
            margin: 8px 0;
            display: flex;
            justify-content: flex-end;
            gap: 20px;
        }
        .total-label {
            font-weight: normal;
            min-width: 120px;
        }
        .total-amount {
            font-weight: bold;
            min-width: 100px;
            text-align: right;
        }
        .final-total {
            font-size: 20px;
            border-top: 2px solid #3b82f6;
            padding-top: 8px;
            margin-top: 12px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Factuur {{INVOICE_NUMBER}}</div>
        <div class="company-name">{{COMPANY_NAME}}</div>
        <div class="company-details">
            {{COMPANY_ADDRESS}}<br>
            {{COMPANY_POSTAL_CODE}} {{COMPANY_CITY}}<br>
            Tel: {{COMPANY_PHONE}} | Email: {{COMPANY_EMAIL}}
        </div>
    </div>
    
    <div class="content">
        <div class="info-section">
            <div class="info-col">
                <div class="info-label">Klant:</div>
                <div class="info-value">{{CUSTOMER_NAME}}</div>
                <div class="info-value">{{CUSTOMER_ADDRESS}}</div>
                <div class="info-value">{{CUSTOMER_POSTAL_CODE}} {{CUSTOMER_CITY}}</div>
            </div>
            <div class="info-col">
                <div class="info-label">Factuurdatum:</div>
                <div class="info-value">{{INVOICE_DATE}}</div>
                <div class="info-label">Vervaldatum:</div>
                <div class="info-value">{{DUE_DATE}}</div>
                <div class="info-label">Betreft:</div>
                <div class="info-value">{{INVOICE_SUBJECT}}</div>
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
        
        <div class="totals">
            <div class="total-row">
                <div class="total-label">Subtotaal:</div>
                <div class="total-amount">€{{SUBTOTAL}}</div>
            </div>
            <div class="total-row">
                <div class="total-label">BTW ({{VAT_PERCENTAGE}}%):</div>
                <div class="total-amount">€{{VAT_AMOUNT}}</div>
            </div>
            <div class="total-row final-total">
                <div class="total-label">Totaal:</div>
                <div class="total-amount">€{{TOTAL_AMOUNT}}</div>
            </div>
        </div>
        
        <div class="footer">
            <p>Betaling binnen {{PAYMENT_TERMS}} dagen na factuurdatum.</p>
            <p>{{COMPANY_NAME}} | KvK: {{COMPANY_KVK}} | BTW-nr: {{COMPANY_VAT}}</p>
            <p>IBAN: {{COMPANY_IBAN}} | BIC: {{COMPANY_BIC}}</p>
        </div>
    </div>
</body>
</html>`;
  }
}
