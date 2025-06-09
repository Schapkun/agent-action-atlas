
import jsPDF from 'jspdf';
import { VisualTemplateData } from '../types/VisualTemplate';

export class PDFGenerator {
  private doc: jsPDF;
  private pageWidth = 210; // A4 width in mm
  private pageHeight = 297; // A4 height in mm
  private margins = 15; // 15mm margins
  private contentWidth = 180; // 210 - 30 (15mm on each side)
  
  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
  }

  generateFromTemplate(templateData: VisualTemplateData): jsPDF {
    const { companyInfo, styling, documentType } = templateData;
    
    console.log('📄 PDF Generator - Using styling directly:', styling);
    
    // Use styling colors DIRECTLY - no overrides
    const primaryColor = styling.primaryColor;
    const secondaryColor = styling.secondaryColor;
    
    console.log('🎨 PDF Colors:', { primaryColor, secondaryColor });
    
    // Set base font
    this.doc.setFont('helvetica');
    
    // Generate sections with simple, working positioning
    this.generateHeader(companyInfo, styling, primaryColor);
    this.generateContent(templateData, primaryColor);
    this.generateTable(primaryColor);
    this.generateFooter();

    console.log('✅ PDF generation completed');
    return this.doc;
  }

  private generateHeader(companyInfo: any, styling: any, primaryColor: string): void {
    let yPos = this.margins + 10;
    
    // Convert hex to RGB
    const rgb = this.hexToRgb(primaryColor);
    
    // Header styling based on headerStyle
    if (styling.headerStyle === 'colored') {
      this.doc.setFillColor(rgb[0], rgb[1], rgb[2]);
      this.doc.rect(this.margins, this.margins, this.contentWidth, 30, 'F');
      this.doc.setTextColor(255, 255, 255);
    } else if (styling.headerStyle === 'bordered') {
      this.doc.setLineWidth(0.5);
      this.doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
      this.doc.rect(this.margins, this.margins, this.contentWidth, 30);
      this.doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    } else {
      this.doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    }
    
    // Company name
    this.doc.setFontSize(20);
    let nameX = this.margins + 5;
    let align: 'left' | 'center' | 'right' = 'left';
    
    if (styling.logoPosition === 'center') {
      nameX = this.pageWidth / 2;
      align = 'center';
    } else if (styling.logoPosition === 'right') {
      nameX = this.pageWidth - this.margins - 5;
      align = 'right';
    }
    
    this.doc.text(companyInfo.name || 'Uw Bedrijf', nameX, yPos + 15, { align });
    
    // Company details
    yPos += 25;
    this.doc.setFontSize(10);
    
    if (styling.headerStyle === 'colored') {
      this.doc.setTextColor(255, 255, 255);
    } else {
      this.doc.setTextColor(120, 120, 120);
    }
    
    if (companyInfo.address) {
      this.doc.text(companyInfo.address, nameX, yPos, { align });
      yPos += 4;
    }
    
    if (companyInfo.postalCode && companyInfo.city) {
      this.doc.text(`${companyInfo.postalCode} ${companyInfo.city}`, nameX, yPos, { align });
      yPos += 4;
    }
    
    if (companyInfo.phone) {
      this.doc.text(`Tel: ${companyInfo.phone}`, nameX, yPos, { align });
      yPos += 4;
    }
    
    if (companyInfo.email) {
      this.doc.text(`Email: ${companyInfo.email}`, nameX, yPos, { align });
    }
  }

  private generateContent(templateData: VisualTemplateData, primaryColor: string): void {
    const { documentType } = templateData;
    
    let yPos = this.margins + 50;
    
    // Convert hex to RGB
    const rgb = this.hexToRgb(primaryColor);
    
    // Document title
    this.doc.setFontSize(18);
    this.doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    
    const docTitle = this.getDocumentTitle(documentType);
    this.doc.text(docTitle, this.margins + 5, yPos);
    
    yPos += 20;

    // Two-column layout
    this.doc.setFontSize(12);
    this.doc.setTextColor(0, 0, 0);
    
    // Left column
    const leftColumnX = this.margins + 5;
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Factuurgegevens', leftColumnX, yPos);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    yPos += 8;
    
    this.doc.text('Factuurnummer: 2024-001', leftColumnX, yPos);
    yPos += 5;
    this.doc.text(`Factuurdatum: ${this.getCurrentDate()}`, leftColumnX, yPos);
    yPos += 5;
    this.doc.text(`Vervaldatum: ${this.getFutureDate(30)}`, leftColumnX, yPos);
    
    // Right column
    const rightColumnX = this.margins + (this.contentWidth * 0.5) + 5;
    yPos = this.margins + 70;
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Klantgegevens', rightColumnX, yPos);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    yPos += 8;
    
    this.doc.text('Voorbeeld Klant B.V.', rightColumnX, yPos);
    yPos += 5;
    this.doc.text('Voorbeeldstraat 123', rightColumnX, yPos);
    yPos += 5;
    this.doc.text('1234 AB Amsterdam', rightColumnX, yPos);
  }

  private generateTable(primaryColor: string): void {
    const startY = this.margins + 120;
    const tableWidth = this.contentWidth;
    const rowHeight = 8;
    
    // Convert hex to RGB
    const rgb = this.hexToRgb(primaryColor);
    
    // Table headers
    this.doc.setLineWidth(0.5);
    this.doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    this.doc.line(this.margins, startY + 8, this.margins + tableWidth, startY + 8);
    
    // Header text
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    
    const col1X = this.margins + 2;
    const col2X = this.margins + (tableWidth * 0.7);
    const col3X = this.margins + (tableWidth * 0.85);
    const col4X = this.margins + tableWidth - 2;
    
    this.doc.text('Beschrijving', col1X, startY + 5);
    this.doc.text('Aantal', col2X, startY + 5, { align: 'right' });
    this.doc.text('Prijs', col3X, startY + 5, { align: 'right' });
    this.doc.text('Totaal', col4X, startY + 5, { align: 'right' });

    // Table data
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont('helvetica', 'normal');
    
    const tableData = [
      ['Consultancy diensten', '10', '€ 75,00', '€ 750,00'],
      ['Reiskosten', '1', '€ 50,00', '€ 50,00']
    ];
    
    let rowY = startY + 12;
    
    tableData.forEach((row) => {
      this.doc.text(row[0], col1X, rowY);
      this.doc.text(row[1], col2X, rowY, { align: 'right' });
      this.doc.text(row[2], col3X, rowY, { align: 'right' });
      this.doc.text(row[3], col4X, rowY, { align: 'right' });
      
      // Bottom border
      this.doc.setDrawColor(229, 231, 235);
      this.doc.setLineWidth(0.1);
      this.doc.line(this.margins, rowY + 3, this.margins + tableWidth, rowY + 3);
      
      rowY += rowHeight;
    });

    // Totals section
    rowY += 5;
    this.doc.setFont('helvetica', 'normal');
    
    this.doc.text('Subtotaal:', col3X, rowY, { align: 'right' });
    this.doc.text('€ 800,00', col4X, rowY, { align: 'right' });
    rowY += 6;
    
    this.doc.text('BTW (21%):', col3X, rowY, { align: 'right' });
    this.doc.text('€ 168,00', col4X, rowY, { align: 'right' });
    rowY += 8;
    
    // Total with colored line
    this.doc.setLineWidth(0.5);
    this.doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    this.doc.line(col3X - 10, rowY - 2, this.margins + tableWidth, rowY - 2);
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    this.doc.text('Totaal:', col3X, rowY, { align: 'right' });
    this.doc.text('€ 968,00', col4X, rowY, { align: 'right' });
  }

  private generateFooter(): void {
    const footerY = this.pageHeight - 30;
    
    // Footer border
    this.doc.setDrawColor(209, 213, 219);
    this.doc.setLineWidth(0.1);
    this.doc.line(this.margins, footerY - 5, this.margins + this.contentWidth, footerY - 5);
    
    // Footer text
    this.doc.setTextColor(107, 114, 128);
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    
    this.doc.text('Betaling binnen 30 dagen na factuurdatum.', this.margins + 5, footerY);
  }

  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 0, 0];
  }

  private getDocumentTitle(documentType: string): string {
    switch (documentType) {
      case 'invoice':
        return 'FACTUUR';
      case 'quote':
        return 'OFFERTE';
      case 'letter':
        return 'BRIEF';
      default:
        return 'DOCUMENT';
    }
  }

  private getCurrentDate(): string {
    return new Date().toLocaleDateString('nl-NL');
  }

  private getFutureDate(daysFromNow: number): string {
    return new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL');
  }

  download(filename: string = 'document.pdf') {
    this.doc.save(filename);
  }
}
