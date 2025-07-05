
import jsPDF from 'jspdf';
import { PDFUtils } from './PDFUtils';

export class PDFFooterGenerator {
  private doc: jsPDF;
  private margins: number;
  private contentWidth: number;
  private pageHeight: number;

  constructor(doc: jsPDF, margins: number, contentWidth: number, pageHeight: number) {
    this.doc = doc;
    this.margins = margins;
    this.contentWidth = contentWidth;
    this.pageHeight = pageHeight;
  }

  generateFooter(): void {
    // EXACT CSS positioning: bottom margin + padding conversion
    const footerY = this.pageHeight - PDFUtils.pxToMm(60); // Match CSS bottom padding
    
    // Footer border - EXACT CSS: 1pt border-top → 0.353mm
    this.doc.setDrawColor(209, 213, 219); // CSS: border-gray-300
    this.doc.setLineWidth(0.353); // EXACT CSS 1pt conversion
    this.doc.line(this.margins, footerY - PDFUtils.pxToMm(32), this.margins + this.contentWidth, footerY - PDFUtils.pxToMm(32));
    
    // Footer text with EXACT CSS styling
    this.doc.setTextColor(107, 114, 128); // CSS: text-gray-500
    this.doc.setFontSize(9); // CSS: 9pt font-size
    this.doc.setFont('helvetica', 'normal');
    
    // EXACT CSS padding-top: 32px conversion
    this.doc.text('Betaling binnen 30 dagen na factuurdatum.', this.margins + PDFUtils.pxToMm(16), footerY);
  }
}
