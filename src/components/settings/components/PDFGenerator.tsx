
import jsPDF from 'jspdf';
import { VisualTemplateData } from '../types/VisualTemplate';
import { getLayoutSpecificStyles } from '../../../utils/layoutStyles';

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
    const { companyInfo, styling, documentType, layout } = templateData;
    
    // Get layout-specific styles using shared utility (same as preview)
    const layoutStyles = getLayoutSpecificStyles(layout || 'business-green');
    
    // Set base font
    this.doc.setFont('helvetica');
    
    // Generate header with same logic as preview
    this.generateMatchingHeader(companyInfo, styling, layoutStyles);
    
    // Generate document content matching preview
    this.generateMatchingContent(templateData, layoutStyles);
    
    // Generate table matching preview styling EXACTLY
    this.generateMatchingTable(layoutStyles);
    
    // Generate footer matching preview
    this.generateMatchingFooter();

    return this.doc;
  }

  private generateMatchingHeader(companyInfo: any, styling: any, layoutStyles: any) {
    let yPos = this.margins + 10;
    
    // Header background/border based on headerStyle (same as preview logic)
    if (styling.headerStyle === 'colored') {
      const rgb = this.hexToRgb(layoutStyles.primaryColor);
      this.doc.setFillColor(rgb[0], rgb[1], rgb[2]);
      this.doc.rect(this.margins, this.margins, this.contentWidth, 25, 'F');
      this.doc.setTextColor(255, 255, 255);
    } else if (styling.headerStyle === 'bordered') {
      const rgb = this.hexToRgb(layoutStyles.primaryColor);
      this.doc.setLineWidth(1);
      this.doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
      this.doc.rect(this.margins, this.margins, this.contentWidth, 25);
      this.doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    } else {
      const rgb = this.hexToRgb(layoutStyles.primaryColor);
      this.doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    }
    
    // Company name with logo positioning (same as preview)
    // Match preview typography: 20pt font size
    this.doc.setFontSize(20);
    let nameX = this.margins + 5;
    let detailsX = this.margins + 5;
    let align: 'left' | 'center' | 'right' = 'left';
    
    switch (styling.logoPosition) {
      case 'center':
        nameX = this.pageWidth / 2;
        detailsX = this.pageWidth / 2;
        align = 'center';
        break;
      case 'right':
        nameX = this.pageWidth - this.margins - 5;
        detailsX = this.pageWidth - this.margins - 5;
        align = 'right';
        break;
    }
    
    this.doc.text(companyInfo.name || 'Uw Bedrijf', nameX, yPos, { align });
    
    // Company details with proper positioning (same as preview)
    yPos += 8;
    // Match preview typography: 10pt font size
    this.doc.setFontSize(10);
    
    if (styling.headerStyle === 'colored') {
      this.doc.setTextColor(255, 255, 255);
    } else {
      this.doc.setTextColor(120, 120, 120);
    }
    
    if (companyInfo.address) {
      this.doc.text(companyInfo.address, detailsX, yPos, { align });
      yPos += 4;
    }
    
    if (companyInfo.postalCode && companyInfo.city) {
      this.doc.text(`${companyInfo.postalCode} ${companyInfo.city}`, detailsX, yPos, { align });
      yPos += 4;
    }
    
    if (companyInfo.phone) {
      this.doc.text(`Tel: ${companyInfo.phone}`, detailsX, yPos, { align });
      yPos += 4;
    }
    
    if (companyInfo.email) {
      this.doc.text(`Email: ${companyInfo.email}`, detailsX, yPos, { align });
      yPos += 4;
    }
    
    if (companyInfo.website) {
      this.doc.text(`Web: ${companyInfo.website}`, detailsX, yPos, { align });
    }
  }

  private generateMatchingContent(templateData: VisualTemplateData, layoutStyles: any) {
    const { documentType } = templateData;
    let yPos = 70;

    // Document title with exact same styling as preview
    // Match preview typography: 18pt font size
    this.doc.setFontSize(18);
    const titleRgb = this.hexToRgb(layoutStyles.primaryColor);
    this.doc.setTextColor(titleRgb[0], titleRgb[1], titleRgb[2]);
    
    const docTitle = documentType === 'invoice' ? 'FACTUUR' : 
                    documentType === 'quote' ? 'OFFERTE' : 
                    documentType === 'letter' ? 'BRIEF' : 'DOCUMENT';
    this.doc.text(docTitle, this.margins + 5, yPos);
    
    yPos += 15;

    // Two-column layout for invoice and customer details (same as preview grid-cols-2)
    // Match preview typography: 12pt for headers
    this.doc.setFontSize(12);
    this.doc.setTextColor(0, 0, 0);
    
    // Left column - Invoice details
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Factuurgegevens', this.margins + 5, yPos);
    
    this.doc.setFont('helvetica', 'normal');
    // Match preview typography: 10pt for content
    this.doc.setFontSize(10);
    yPos += 6;
    this.doc.text('Factuurnummer: 2024-001', this.margins + 5, yPos);
    yPos += 4;
    this.doc.text(`Factuurdatum: ${new Date().toLocaleDateString('nl-NL')}`, this.margins + 5, yPos);
    yPos += 4;
    this.doc.text(`Vervaldatum: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL')}`, this.margins + 5, yPos);
    
    // Right column - Customer details (positioned exactly like preview grid at 50%)
    const rightColumnX = this.margins + (this.contentWidth * 0.5);
    yPos = 85; // Reset to same height as left column
    
    // Match preview typography: 12pt for headers
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Klantgegevens', rightColumnX, yPos);
    
    this.doc.setFont('helvetica', 'normal');
    // Match preview typography: 10pt for content
    this.doc.setFontSize(10);
    yPos += 6;
    this.doc.text('Voorbeeld Klant B.V.', rightColumnX, yPos);
    yPos += 4;
    this.doc.text('Voorbeeldstraat 123', rightColumnX, yPos);
    yPos += 4;
    this.doc.text('1234 AB Amsterdam', rightColumnX, yPos);
  }

  private generateMatchingTable(layoutStyles: any) {
    const startY = 120;
    const tableWidth = this.contentWidth;
    const rowHeight = 8;
    const headerHeight = 10;
    
    // Table headers with EXACT same styling as preview
    // Preview uses border-bottom: '2pt solid' NOT filled background
    const headerRgb = this.hexToRgb(layoutStyles.primaryColor);
    
    // NO background fill - just border like preview
    this.doc.setLineWidth(2); // Match preview's 2pt border
    this.doc.setDrawColor(headerRgb[0], headerRgb[1], headerRgb[2]);
    this.doc.line(this.margins, startY + headerHeight, this.margins + tableWidth, startY + headerHeight);
    
    // Header text - black color like preview
    this.doc.setTextColor(0, 0, 0); // Black text like preview
    // Match preview typography: 10pt for table
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    
    // Column positions matching preview table layout exactly
    const col1X = this.margins + 2;
    const col2X = this.margins + (tableWidth * 0.6);
    const col3X = this.margins + (tableWidth * 0.75);
    const col4X = this.margins + (tableWidth * 0.9);
    
    this.doc.text('Beschrijving', col1X, startY + 6);
    this.doc.text('Aantal', col2X, startY + 6);
    this.doc.text('Prijs', col3X, startY + 6);
    this.doc.text('Totaal', col4X, startY + 6);

    // Table data with same formatting as preview
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont('helvetica', 'normal');
    
    const tableData = [
      ['Consultancy diensten', '10', '€ 75,00', '€ 750,00'],
      ['Reiskosten', '1', '€ 50,00', '€ 50,00']
    ];
    
    let rowY = startY + headerHeight + 2;
    
    tableData.forEach((row, index) => {
      // Row background (alternating like preview if needed)
      if (index % 2 === 1) {
        this.doc.setFillColor(248, 249, 250);
        this.doc.rect(this.margins, rowY - 2, tableWidth, rowHeight, 'F');
      }
      
      this.doc.text(row[0], col1X, rowY + 4);
      this.doc.text(row[1], col2X, rowY + 4);
      this.doc.text(row[2], col3X, rowY + 4);
      this.doc.text(row[3], col4X, rowY + 4);
      
      // Bottom border matching preview's 1pt
      this.doc.setDrawColor(229, 231, 235);
      this.doc.setLineWidth(0.1);
      this.doc.line(this.margins, rowY + rowHeight, this.margins + tableWidth, rowY + rowHeight);
      
      rowY += rowHeight;
    });

    // Totals section matching preview styling exactly
    rowY += 5;
    this.doc.setFont('helvetica', 'normal');
    
    this.doc.text('Subtotaal:', col3X, rowY);
    this.doc.text('€ 800,00', col4X, rowY);
    rowY += 5;
    
    this.doc.text('BTW (21%):', col3X, rowY);
    this.doc.text('€ 168,00', col4X, rowY);
    rowY += 8;
    
    // Total with accent color and border EXACTLY like preview
    const totalRgb = this.hexToRgb(layoutStyles.primaryColor);
    this.doc.setLineWidth(2); // Match preview's 2pt border
    this.doc.setDrawColor(totalRgb[0], totalRgb[1], totalRgb[2]);
    this.doc.line(col3X, rowY - 2, this.margins + tableWidth, rowY - 2);
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(totalRgb[0], totalRgb[1], totalRgb[2]);
    this.doc.text('Totaal:', col3X, rowY);
    this.doc.text('€ 968,00', col4X, rowY);
  }

  private generateMatchingFooter() {
    const footerY = this.pageHeight - 25;
    
    // Footer border matching preview exactly
    this.doc.setDrawColor(209, 213, 219);
    this.doc.setLineWidth(0.2);
    this.doc.line(this.margins, footerY - 5, this.margins + this.contentWidth, footerY - 5);
    
    // Footer text matching preview styling
    this.doc.setTextColor(107, 114, 128);
    // Match preview typography: 9pt for footer
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

  download(filename: string = 'document.pdf') {
    this.doc.save(filename);
  }
}
