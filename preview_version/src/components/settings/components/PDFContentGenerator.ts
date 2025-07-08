
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
    
    // EXACT CSS positioning: header height + margin-bottom
    let yPos = this.margins + PDFUtils.pxToMm(100 + 32); // Header + spacing

    // Document title with EXACT preview styling
    this.doc.setFontSize(18);
    const titleRgb = PDFUtils.hexToRgb(layoutStyles.primaryColor);
    this.doc.setTextColor(titleRgb[0], titleRgb[1], titleRgb[2]);
    
    const docTitle = PDFUtils.getDocumentTitle(documentType);
    this.doc.text(docTitle, this.margins + PDFUtils.pxToMm(16), yPos);
    
    // EXACT CSS margin-bottom: 32px → 8.448mm
    yPos += PDFUtils.pxToMm(32 + 18); // Title margin + font height

    // Two-column layout with EXACT CSS grid gap (32px)
    this.doc.setFontSize(12);
    this.doc.setTextColor(0, 0, 0);
    
    // Left column - EXACT positioning
    const leftColumnX = this.margins + PDFUtils.pxToMm(16);
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Factuurgegevens', leftColumnX, yPos);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    
    // EXACT CSS space-y-1 spacing (4px)
    const detailSpacing = PDFUtils.pxToMm(4);
    yPos += PDFUtils.pxToMm(8); // CSS margin-bottom: 8px
    
    this.doc.text('Factuurnummer: 2024-001', leftColumnX, yPos);
    yPos += detailSpacing;
    this.doc.text(`Factuurdatum: ${PDFUtils.getCurrentDate()}`, leftColumnX, yPos);
    yPos += detailSpacing;
    this.doc.text(`Vervaldatum: ${PDFUtils.getFutureDate(30)}`, leftColumnX, yPos);
    
    // Right column - EXACT 50% positioning like CSS grid-cols-2
    const rightColumnX = this.margins + (this.contentWidth * 0.5) + PDFUtils.pxToMm(16);
    yPos = this.margins + PDFUtils.pxToMm(100 + 32 + 32 + 18); // Reset to title level
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Klantgegevens', rightColumnX, yPos);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    yPos += PDFUtils.pxToMm(8);
    
    this.doc.text('Voorbeeld Klant B.V.', rightColumnX, yPos);
    yPos += detailSpacing;
    this.doc.text('Voorbeeldstraat 123', rightColumnX, yPos);
    yPos += detailSpacing;
    this.doc.text('1234 AB Amsterdam', rightColumnX, yPos);
  }
}
