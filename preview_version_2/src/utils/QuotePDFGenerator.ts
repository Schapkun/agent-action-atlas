
import jsPDF from 'jspdf';

interface QuoteFormData {
  client_name: string;
  client_email?: string;
  client_address?: string;
  client_postal_code?: string;
  client_city?: string;
  client_country?: string;
  quote_date: string;
  valid_until: string;
  notes?: string;
  vat_percentage: number;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  line_total: number;
}

interface CompanyInfo {
  name: string;
  address?: string;
  postalCode?: string;
  city?: string;
  phone?: string;
  email?: string;
  kvk?: string;
  vat?: string;
  iban?: string;
  bic?: string;
}

export class QuotePDFGenerator {
  private doc: jsPDF;
  private pageWidth = 210;
  private pageHeight = 297;
  private margins = 15;
  private contentWidth = 180;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
  }

  static async generatePDF(
    formData: QuoteFormData,
    lineItems: LineItem[],
    quoteNumber: string,
    companyInfo?: CompanyInfo,
    options: { download?: boolean; returnBlob?: boolean } = { download: true }
  ): Promise<Blob | void> {
    const generator = new QuotePDFGenerator();
    generator.generateContent(formData, lineItems, quoteNumber, companyInfo);
    
    if (options.returnBlob) {
      const pdfBlob = generator.doc.output('blob');
      return pdfBlob;
    }
    
    if (options.download) {
      generator.doc.save(`Offerte-${quoteNumber}.pdf`);
    }
  }

  private generateContent(
    formData: QuoteFormData,
    lineItems: LineItem[],
    quoteNumber: string,
    companyInfo?: CompanyInfo
  ) {
    this.doc.setFont('helvetica');
    this.generateHeader(companyInfo);
    this.generateQuoteInfo(quoteNumber, formData);
    this.generateClientInfo(formData);
    this.generateLineItems(lineItems);
    this.generateTotals(lineItems);
    this.generateNotes(formData.notes);
    this.generateFooter();
  }

  private generateHeader(companyInfo?: CompanyInfo) {
    let yPos = this.margins + 10;
    
    this.doc.setFontSize(20);
    this.doc.setTextColor(44, 82, 130);
    this.doc.text(companyInfo?.name || 'Uw Bedrijf', this.margins + 5, yPos);
    
    yPos += 15;
    this.doc.setFontSize(10);
    this.doc.setTextColor(120, 120, 120);
    
    if (companyInfo?.address) {
      this.doc.text(companyInfo.address, this.margins + 5, yPos);
      yPos += 4;
    }
    
    if (companyInfo?.postalCode && companyInfo?.city) {
      this.doc.text(`${companyInfo.postalCode} ${companyInfo.city}`, this.margins + 5, yPos);
      yPos += 4;
    }
    
    if (companyInfo?.phone) {
      this.doc.text(`Tel: ${companyInfo.phone}`, this.margins + 5, yPos);
      yPos += 4;
    }
    
    if (companyInfo?.email) {
      this.doc.text(`Email: ${companyInfo.email}`, this.margins + 5, yPos);
    }
  }

  private generateQuoteInfo(quoteNumber: string, formData: QuoteFormData) {
    const yPos = this.margins + 70;
    
    this.doc.setFontSize(18);
    this.doc.setTextColor(44, 82, 130);
    this.doc.text('OFFERTE', this.margins + 5, yPos);
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(`Offerte nummer: ${quoteNumber}`, this.margins + 5, yPos + 10);
    this.doc.text(`Datum: ${new Date(formData.quote_date).toLocaleDateString('nl-NL')}`, this.margins + 5, yPos + 20);
    this.doc.text(`Geldig tot: ${new Date(formData.valid_until).toLocaleDateString('nl-NL')}`, this.margins + 5, yPos + 30);
  }

  private generateClientInfo(formData: QuoteFormData) {
    const yPos = this.margins + 110;
    
    this.doc.setFontSize(12);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('Aan:', this.margins + 5, yPos);
    
    this.doc.setFontSize(10);
    let clientYPos = yPos + 8;
    
    this.doc.text(formData.client_name, this.margins + 5, clientYPos);
    clientYPos += 5;
    
    if (formData.client_address) {
      this.doc.text(formData.client_address, this.margins + 5, clientYPos);
      clientYPos += 5;
    }
    
    if (formData.client_postal_code && formData.client_city) {
      this.doc.text(`${formData.client_postal_code} ${formData.client_city}`, this.margins + 5, clientYPos);
      clientYPos += 5;
    }
    
    if (formData.client_email) {
      this.doc.text(formData.client_email, this.margins + 5, clientYPos);
    }
  }

  private generateLineItems(lineItems: LineItem[]) {
    const startY = this.margins + 160;
    
    // Table headers
    this.doc.setFontSize(10);
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont('helvetica', 'bold');
    
    this.doc.text('Omschrijving', this.margins + 5, startY);
    this.doc.text('Aantal', this.margins + 110, startY, { align: 'right' });
    this.doc.text('Prijs', this.margins + 140, startY, { align: 'right' });
    this.doc.text('BTW', this.margins + 160, startY, { align: 'right' });
    this.doc.text('Totaal', this.margins + 175, startY, { align: 'right' });
    
    // Header line
    this.doc.setDrawColor(44, 82, 130);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margins, startY + 3, this.margins + this.contentWidth, startY + 3);
    
    // Table data
    this.doc.setFont('helvetica', 'normal');
    let rowY = startY + 10;
    
    lineItems.forEach((item) => {
      this.doc.text(item.description, this.margins + 5, rowY);
      this.doc.text(item.quantity.toString(), this.margins + 110, rowY, { align: 'right' });
      this.doc.text(`€ ${item.unit_price.toFixed(2)}`, this.margins + 140, rowY, { align: 'right' });
      this.doc.text(`${item.vat_rate}%`, this.margins + 160, rowY, { align: 'right' });
      this.doc.text(`€ ${item.line_total.toFixed(2)}`, this.margins + 175, rowY, { align: 'right' });
      
      rowY += 8;
    });
  }

  private generateTotals(lineItems: LineItem[]) {
    const subtotal = lineItems.reduce((sum, item) => sum + item.line_total, 0);
    const vatAmount = lineItems.reduce((sum, item) => sum + (item.line_total * item.vat_rate / 100), 0);
    const total = subtotal + vatAmount;
    
    const startY = this.margins + 200 + (lineItems.length * 8);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Subtotaal:', this.margins + 140, startY, { align: 'right' });
    this.doc.text(`€ ${subtotal.toFixed(2)}`, this.margins + 175, startY, { align: 'right' });
    
    this.doc.text('BTW:', this.margins + 140, startY + 8, { align: 'right' });
    this.doc.text(`€ ${vatAmount.toFixed(2)}`, this.margins + 175, startY + 8, { align: 'right' });
    
    // Total line
    this.doc.setDrawColor(44, 82, 130);
    this.doc.line(this.margins + 120, startY + 12, this.margins + this.contentWidth, startY + 12);
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(44, 82, 130);
    this.doc.text('Totaal:', this.margins + 140, startY + 20, { align: 'right' });
    this.doc.text(`€ ${total.toFixed(2)}`, this.margins + 175, startY + 20, { align: 'right' });
  }

  private generateNotes(notes?: string) {
    if (!notes) return;
    
    const startY = this.margins + 240;
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('Opmerkingen:', this.margins + 5, startY);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(60, 60, 60);
    
    const lines = this.doc.splitTextToSize(notes, this.contentWidth - 10);
    this.doc.text(lines, this.margins + 5, startY + 8);
  }

  private generateFooter() {
    const footerY = this.pageHeight - 30;
    
    this.doc.setDrawColor(209, 213, 219);
    this.doc.setLineWidth(0.1);
    this.doc.line(this.margins, footerY - 5, this.margins + this.contentWidth, footerY - 5);
    
    this.doc.setTextColor(107, 114, 128);
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    
    this.doc.text('Deze offerte is geldig tot de genoemde datum.', this.margins + 5, footerY);
  }
}
