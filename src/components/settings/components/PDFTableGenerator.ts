
import jsPDF from 'jspdf';
import { PDFUtils } from './PDFUtils';

export class PDFTableGenerator {
  private doc: jsPDF;
  private margins: number;
  private contentWidth: number;

  constructor(doc: jsPDF, margins: number, contentWidth: number) {
    this.doc = doc;
    this.margins = margins;
    this.contentWidth = contentWidth;
  }

  generateTable(layoutStyles: any): void {
    const startY = 120;
    const tableWidth = this.contentWidth;
    const rowHeight = 11; // Increased from 8 to match 8px padding (3mm) + content
    const headerHeight = 12; // Slightly increased for better header spacing
    
    // Table headers - EXACT preview styling with correct border thickness
    const headerRgb = PDFUtils.hexToRgb(layoutStyles.primaryColor);
    
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
    const totalRgb = PDFUtils.hexToRgb(layoutStyles.primaryColor);
    this.doc.setLineWidth(0.7); // FIXED: CSS 2pt = 0.7mm
    this.doc.setDrawColor(totalRgb[0], totalRgb[1], totalRgb[2]);
    this.doc.line(col3RightX - 40, rowY - 2, this.margins + tableWidth, rowY - 2);
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(totalRgb[0], totalRgb[1], totalRgb[2]);
    this.doc.text('Totaal:', col3RightX, rowY, { align: 'right' });
    this.doc.text('€ 968,00', col4RightX, rowY, { align: 'right' });
  }
}
