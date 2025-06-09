
import jsPDF from 'jspdf';
import { PDFUtils } from './PDFUtils';
import { VisualTemplateData } from '../types/VisualTemplate';

export class PDFContentGenerator {
  private doc: jsPDF;
  private margins: number;
  private contentWidth: number;

  constructor(doc: jsPDF, margins: number, contentWidth: number) {
    this.doc = doc;
    this.margins = margins;
    this.contentWidth = contentWidth;
  }

  generateContent(templateData: VisualTemplateData, layoutStyles: any): void {
    const { documentType } = templateData;
    let yPos = 70;

    // Document title with exact preview styling
    this.doc.setFontSize(18);
    const titleRgb = PDFUtils.hexToRgb(layoutStyles.primaryColor);
    this.doc.setTextColor(titleRgb[0], titleRgb[1], titleRgb[2]);
    
    const docTitle = PDFUtils.getDocumentTitle(documentType);
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
    this.doc.text(`Factuurdatum: ${PDFUtils.getCurrentDate()}`, this.margins + 5, yPos);
    yPos += 4;
    this.doc.text(`Vervaldatum: ${PDFUtils.getFutureDate(30)}`, this.margins + 5, yPos);
    
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
}
