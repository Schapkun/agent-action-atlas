
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
    
    // DEBUG: Log actual layout being used
    console.log('🎨 PDF Generator - Layout used:', layout);
    console.log('🎨 PDF Generator - Styling:', styling);
    
    // FORCE business-green layout if undefined or incorrect
    const actualLayout = layout || 'business-green';
    console.log('🎨 PDF Generator - Forced layout:', actualLayout);
    
    // Get layout-specific styles - FORCE green colors
    const layoutStyles = getLayoutSpecificStyles(actualLayout);
    
    // OVERRIDE to ensure green color is used (fix for blue showing up)
    if (actualLayout === 'business-green' || !layout) {
      layoutStyles.primaryColor = '#059669'; // Force business green
      layoutStyles.secondaryColor = '#10b981'; // Force business green secondary
      console.log('🟢 PDF Generator - FORCED green colors:', layoutStyles.primaryColor);
    }
    
    // Set base font
    this.doc.setFont('helvetica');
    
    // Generate header with exact preview matching
    this.generateMatchingHeader(companyInfo, styling, layoutStyles);
    
    // Generate document content with exact spacing
    this.generateMatchingContent(templateData, layoutStyles);
    
    // Generate table with EXACT preview styling
    this.generateMatchingTable(layoutStyles);
    
    // Generate footer with correct positioning
    this.generateMatchingFooter();

    return this.doc;
  }

  private generateMatchingHeader(companyInfo: any, styling: any, layoutStyles: any) {
    let yPos = this.margins + 10;
    
    // Header background/border based on headerStyle (exact preview logic)
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
    
    // Company name with exact logo positioning (match preview)
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
    
    // Company details with harmonized spacing (3mm like preview 8px)
    yPos += 7; // Reduced from 8 to match preview better
    this.doc.setFontSize(10);
    
    if (styling.headerStyle === 'colored') {
      this.doc.setTextColor(255, 255, 255);
    } else {
      this.doc.setTextColor(120, 120, 120);
    }
    
    // Improved spacing - match preview line height exactly
    if (companyInfo.address) {
      this.doc.text(companyInfo.address, detailsX, yPos, { align });
      yPos += 3.5; // Harmonized spacing
    }
    
    if (companyInfo.postalCode && companyInfo.city) {
      this.doc.text(`${companyInfo.postalCode} ${companyInfo.city}`, detailsX, yPos, { align });
      yPos += 3.5;
    }
    
    if (companyInfo.phone) {
      this.doc.text(`Tel: ${companyInfo.phone}`, detailsX, yPos, { align });
      yPos += 3.5;
    }
    
    if (companyInfo.email) {
      this.doc.text(`Email: ${companyInfo.email}`, detailsX, yPos, { align });
      yPos += 3.5;
    }
    
    if (companyInfo.website) {
      this.doc.text(`Web: ${companyInfo.website}`, detailsX, yPos, { align });
    }
  }

  private generateMatchingContent(templateData: VisualTemplateData, layoutStyles: any) {
    const { documentType } = templateData;
    let yPos = 70;

    // Document title with exact preview styling
    this.doc.setFontSize(18);
    const titleRgb = this.hexToRgb(layoutStyles.primaryColor);
    this.doc.setTextColor(titleRgb[0], titleRgb[1], titleRgb[2]);
    
    const docTitle = documentType === 'invoice' ? 'FACTUUR' : 
                    documentType === 'quote' ? 'OFFERTE' : 
                    documentType === 'letter' ? 'BRIEF' : 'DOCUMENT';
    this.doc.text(docTitle, this.margins + 5, yPos);
    
    yPos += 15;

    // Two-column layout with exact spacing (harmonized with preview)
    this.doc.setFontSize(12);
    this.doc.setTextColor(0, 0, 0);
    
    // Left column - Invoice details
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Factuurgegevens', this.margins + 5, yPos);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    yPos += 6;
    this.doc.text('Factuurnummer: 2024-001', this.margins + 5, yPos);
    yPos += 4;
    this.doc.text(`Factuurdatum: ${new Date().toLocaleDateString('nl-NL')}`, this.margins + 5, yPos);
    yPos += 4;
    this.doc.text(`Vervaldatum: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL')}`, this.margins + 5, yPos);
    
    // Right column positioned exactly like preview (50% width)
    const rightColumnX = this.margins + (this.contentWidth * 0.5);
    yPos = 85;
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Klantgegevens', rightColumnX, yPos);
    
    this.doc.setFont('helvetica', 'normal');
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
    const rowHeight = 11; // Increased from 8 to match 8px padding (3mm) + content
    const headerHeight = 12; // Slightly increased for better header spacing
    
    // Table headers - EXACT preview styling with correct border thickness
    const headerRgb = this.hexToRgb(layoutStyles.primaryColor);
    
    // CORRECTED border thickness: CSS 2pt = PDF 0.7mm (not 2mm!)
    this.doc.setLineWidth(0.7); // FIXED: CSS 2pt conversion
    this.doc.setDrawColor(headerRgb[0], headerRgb[1], headerRgb[2]);
    this.doc.line(this.margins, startY + headerHeight, this.margins + tableWidth, startY + headerHeight);
    
    // Header text - black like preview
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    
    // Column positions - EXACT right alignment
    const col1X = this.margins + 2;
    const col2RightX = this.margins + (tableWidth * 0.7);
    const col3RightX = this.margins + (tableWidth * 0.85);
    const col4RightX = this.margins + tableWidth - 2;
    
    // Headers with perfect alignment
    this.doc.text('Beschrijving', col1X, startY + 7); // Adjusted Y for better spacing
    this.doc.text('Aantal', col2RightX, startY + 7, { align: 'right' });
    this.doc.text('Prijs', col3RightX, startY + 7, { align: 'right' });
    this.doc.text('Totaal', col4RightX, startY + 7, { align: 'right' });

    // Table data with harmonized spacing
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont('helvetica', 'normal');
    
    const tableData = [
      ['Consultancy diensten', '10', '€ 75,00', '€ 750,00'],
      ['Reiskosten', '1', '€ 50,00', '€ 50,00']
    ];
    
    let rowY = startY + headerHeight + 3; // Improved spacing
    
    tableData.forEach((row, index) => {
      // Alternating row background
      if (index % 2 === 1) {
        this.doc.setFillColor(248, 249, 250);
        this.doc.rect(this.margins, rowY - 2, tableWidth, rowHeight, 'F');
      }
      
      // Data with perfect right alignment
      this.doc.text(row[0], col1X, rowY + 5); // Adjusted for 3mm padding equivalent
      this.doc.text(row[1], col2RightX, rowY + 5, { align: 'right' });
      this.doc.text(row[2], col3RightX, rowY + 5, { align: 'right' });
      this.doc.text(row[3], col4RightX, rowY + 5, { align: 'right' });
      
      // Bottom border - subtle like preview
      this.doc.setDrawColor(229, 231, 235);
      this.doc.setLineWidth(0.1);
      this.doc.line(this.margins, rowY + rowHeight, this.margins + tableWidth, rowY + rowHeight);
      
      rowY += rowHeight;
    });

    // Totals section with EXACT preview alignment
    rowY += 6; // Better spacing
    this.doc.setFont('helvetica', 'normal');
    
    // Subtotals - perfect right alignment
    this.doc.text('Subtotaal:', col3RightX, rowY, { align: 'right' });
    this.doc.text('€ 800,00', col4RightX, rowY, { align: 'right' });
    rowY += 5;
    
    this.doc.text('BTW (21%):', col3RightX, rowY, { align: 'right' });
    this.doc.text('€ 168,00', col4RightX, rowY, { align: 'right' });
    rowY += 8;
    
    // Total with CORRECTED border thickness and exact color
    const totalRgb = this.hexToRgb(layoutStyles.primaryColor);
    this.doc.setLineWidth(0.7); // FIXED: CSS 2pt = 0.7mm
    this.doc.setDrawColor(totalRgb[0], totalRgb[1], totalRgb[2]);
    this.doc.line(col3RightX - 40, rowY - 2, this.margins + tableWidth, rowY - 2);
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(totalRgb[0], totalRgb[1], totalRgb[2]);
    this.doc.text('Totaal:', col3RightX, rowY, { align: 'right' });
    this.doc.text('€ 968,00', col4RightX, rowY, { align: 'right' });
  }

  private generateMatchingFooter() {
    const footerY = this.pageHeight - 35; // FIXED: Better positioning (was -25)
    
    // Footer border - exact preview styling
    this.doc.setDrawColor(209, 213, 219);
    this.doc.setLineWidth(0.1); // Subtle border like preview
    this.doc.line(this.margins, footerY - 5, this.margins + this.contentWidth, footerY - 5);
    
    // Footer text with exact preview styling
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

  download(filename: string = 'document.pdf') {
    this.doc.save(filename);
  }
}
