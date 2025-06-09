
import jsPDF from 'jspdf';
import { VisualTemplateData } from '../types/VisualTemplate';
import { SharedStyleEngine } from './SharedStyleEngine';

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
    console.log('📄 PDF Generator - Using SharedStyleEngine');
    
    const styleEngine = new SharedStyleEngine(templateData);
    const pdfStyles = styleEngine.getPDFStyles();
    
    // Set base font
    this.doc.setFont('helvetica');
    
    // Generate sections using SharedStyleEngine
    this.generateHeader(templateData.companyInfo, templateData.styling, styleEngine, pdfStyles);
    this.generateContent(templateData, styleEngine, pdfStyles);
    this.generateTable(styleEngine, pdfStyles);
    this.generateFooter();

    console.log('✅ PDF generation completed with SharedStyleEngine');
    return this.doc;
  }

  private generateHeader(companyInfo: any, styling: any, styleEngine: SharedStyleEngine, pdfStyles: any): void {
    let yPos = this.margins + 10;
    
    // Header styling using SharedStyleEngine
    const headerHeight = 30;
    
    if (styling.headerStyle === 'colored' && pdfStyles.colors.headerBg) {
      this.doc.setFillColor(...pdfStyles.colors.headerBg);
      this.doc.rect(this.margins, this.margins, this.contentWidth, headerHeight, 'F');
      this.doc.setTextColor(...pdfStyles.colors.headerText);
    } else if (styling.headerStyle === 'bordered' && pdfStyles.colors.headerBorder) {
      this.doc.setLineWidth(0.5);
      this.doc.setDrawColor(...pdfStyles.colors.headerBorder);
      this.doc.rect(this.margins, this.margins, this.contentWidth, headerHeight);
      this.doc.setTextColor(...pdfStyles.colors.primary);
    } else {
      this.doc.setTextColor(...pdfStyles.colors.primary);
    }
    
    // Company name positioning using SharedStyleEngine alignment
    this.doc.setFontSize(20);
    let nameX = this.margins + 5;
    let align: 'left' | 'center' | 'right' = pdfStyles.alignment.align;
    
    if (pdfStyles.alignment.position === 'center') {
      nameX = this.pageWidth / 2;
    } else if (pdfStyles.alignment.position === 'right') {
      nameX = this.pageWidth - this.margins - 5;
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
      yPos += 4;
    }
    
    if (companyInfo.website) {
      this.doc.text(`Web: ${companyInfo.website}`, nameX, yPos, { align });
    }
  }

  private generateContent(templateData: VisualTemplateData, styleEngine: SharedStyleEngine, pdfStyles: any): void {
    let yPos = this.margins + 50;
    
    // Document title using SharedStyleEngine
    this.doc.setFontSize(18);
    this.doc.setTextColor(...pdfStyles.colors.primary);
    
    const docTitle = styleEngine.getDocumentTitle(templateData.documentType);
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
    this.doc.text(`Factuurdatum: ${styleEngine.getCurrentDate()}`, leftColumnX, yPos);
    yPos += 5;
    this.doc.text(`Vervaldatum: ${styleEngine.getFutureDate(30)}`, leftColumnX, yPos);
    
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

  private generateTable(styleEngine: SharedStyleEngine, pdfStyles: any): void {
    const startY = this.margins + 120;
    const tableWidth = this.contentWidth;
    const rowHeight = 8;
    
    // Table headers using primary color
    this.doc.setLineWidth(0.7);
    this.doc.setDrawColor(...pdfStyles.colors.primary);
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
    
    // BTW met secundaire kleur
    this.doc.setTextColor(...pdfStyles.colors.secondary);
    this.doc.text('BTW (21%):', col3X, rowY, { align: 'right' });
    this.doc.text('€ 168,00', col4X, rowY, { align: 'right' });
    rowY += 8;
    
    // Total met secundaire kleur lijn en tekst
    this.doc.setLineWidth(0.7);
    this.doc.setDrawColor(...pdfStyles.colors.secondary);
    this.doc.line(col3X - 10, rowY - 2, this.margins + tableWidth, rowY - 2);
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...pdfStyles.colors.secondary);
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

  download(filename: string = 'document.pdf') {
    this.doc.save(filename);
  }
}
