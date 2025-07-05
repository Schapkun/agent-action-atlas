
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
    // EXACT CSS positioning: header + content + margin
    const startY = this.margins + PDFUtils.pxToMm(100 + 32 + 100 + 32); // Calculated from CSS
    const tableWidth = this.contentWidth;
    
    // EXACT CSS height conversion: padding 8px + content = 11mm
    const rowHeight = PDFUtils.pxToMm(32); // CSS: padding 8px top/bottom + content
    const headerHeight = PDFUtils.pxToMm(40); // CSS: padding 8px + font height
    
    // Table headers - EXACT CSS border: 2pt → 0.706mm
    const headerRgb = PDFUtils.hexToRgb(layoutStyles.primaryColor);
    
    this.doc.setLineWidth(0.706); // EXACT CSS 2pt conversion
    this.doc.setDrawColor(headerRgb[0], headerRgb[1], headerRgb[2]);
    this.doc.line(this.margins, startY + headerHeight, this.margins + tableWidth, startY + headerHeight);
    
    // Header text with EXACT positioning
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    
    // EXACT column positions matching CSS table layout
    const col1X = this.margins + PDFUtils.pxToMm(8); // CSS padding-left
    const col2RightX = this.margins + (tableWidth * 0.7) - PDFUtils.pxToMm(8);
    const col3RightX = this.margins + (tableWidth * 0.85) - PDFUtils.pxToMm(8);
    const col4RightX = this.margins + tableWidth - PDFUtils.pxToMm(8);
    
    // Headers with EXACT CSS padding: 8px top/bottom
    const headerTextY = startY + PDFUtils.pxToMm(8 + 12); // padding + font baseline
    this.doc.text('Beschrijving', col1X, headerTextY);
    this.doc.text('Aantal', col2RightX, headerTextY, { align: 'right' });
    this.doc.text('Prijs', col3RightX, headerTextY, { align: 'right' });
    this.doc.text('Totaal', col4RightX, headerTextY, { align: 'right' });

    // Table data with EXACT CSS spacing
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont('helvetica', 'normal');
    
    const tableData = [
      ['Consultancy diensten', '10', '€ 75,00', '€ 750,00'],
      ['Reiskosten', '1', '€ 50,00', '€ 50,00']
    ];
    
    let rowY = startY + headerHeight + PDFUtils.pxToMm(4); // Small gap after header
    
    tableData.forEach((row, index) => {
      // Alternating row background - EXACT CSS styling
      if (index % 2 === 1) {
        this.doc.setFillColor(248, 249, 250); // CSS: bg-gray-50
        this.doc.rect(this.margins, rowY, tableWidth, rowHeight, 'F');
      }
      
      // Data with EXACT CSS padding: 8px
      const textY = rowY + PDFUtils.pxToMm(8 + 12); // padding + baseline
      this.doc.text(row[0], col1X, textY);
      this.doc.text(row[1], col2RightX, textY, { align: 'right' });
      this.doc.text(row[2], col3RightX, textY, { align: 'right' });
      this.doc.text(row[3], col4RightX, textY, { align: 'right' });
      
      // Bottom border - EXACT CSS: 1pt → 0.353mm
      this.doc.setDrawColor(229, 231, 235); // CSS: border-gray-200
      this.doc.setLineWidth(0.353);
      this.doc.line(this.margins, rowY + rowHeight, this.margins + tableWidth, rowY + rowHeight);
      
      rowY += rowHeight;
    });

    // Totals section with EXACT CSS spacing
    rowY += PDFUtils.pxToMm(16); // CSS margin-top
    this.doc.setFont('helvetica', 'normal');
    
    // Subtotals - EXACT right alignment
    this.doc.text('Subtotaal:', col3RightX, rowY, { align: 'right' });
    this.doc.text('€ 800,00', col4RightX, rowY, { align: 'right' });
    rowY += PDFUtils.pxToMm(16); // CSS spacing
    
    this.doc.text('BTW (21%):', col3RightX, rowY, { align: 'right' });
    this.doc.text('€ 168,00', col4RightX, rowY, { align: 'right' });
    rowY += PDFUtils.pxToMm(24); // CSS spacing before total
    
    // Total with EXACT CSS border: 2pt top
    const totalRgb = PDFUtils.hexToRgb(layoutStyles.primaryColor);
    this.doc.setLineWidth(0.706); // EXACT CSS 2pt
    this.doc.setDrawColor(totalRgb[0], totalRgb[1], totalRgb[2]);
    this.doc.line(col3RightX - PDFUtils.pxToMm(40), rowY - PDFUtils.pxToMm(4), this.margins + tableWidth, rowY - PDFUtils.pxToMm(4));
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(totalRgb[0], totalRgb[1], totalRgb[2]);
    this.doc.text('Totaal:', col3RightX, rowY, { align: 'right' });
    this.doc.text('€ 968,00', col4RightX, rowY, { align: 'right' });
  }
}
