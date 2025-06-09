
import jsPDF from 'jspdf';

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
}
