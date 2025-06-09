
import jsPDF from 'jspdf';
import { PDFUtils } from './PDFUtils';

export class PDFHeaderGenerator {
  private doc: jsPDF;
  private margins: number;
  private contentWidth: number;
  private pageWidth: number;

  constructor(doc: jsPDF, margins: number, contentWidth: number, pageWidth: number) {
    this.doc = doc;
    this.margins = margins;
    this.contentWidth = contentWidth;
    this.pageWidth = pageWidth;
  }

  generateHeader(companyInfo: any, styling: any, layoutStyles: any): void {
    let yPos = this.margins + 10;
    
    // Header background/border based on headerStyle (exact preview logic)
    if (styling.headerStyle === 'colored') {
      const rgb = PDFUtils.hexToRgb(layoutStyles.primaryColor);
      this.doc.setFillColor(rgb[0], rgb[1], rgb[2]);
      this.doc.rect(this.margins, this.margins, this.contentWidth, 25, 'F');
      this.doc.setTextColor(255, 255, 255);
    } else if (styling.headerStyle === 'bordered') {
      const rgb = PDFUtils.hexToRgb(layoutStyles.primaryColor);
      this.doc.setLineWidth(1);
      this.doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
      this.doc.rect(this.margins, this.margins, this.contentWidth, 25);
      this.doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    } else {
      const rgb = PDFUtils.hexToRgb(layoutStyles.primaryColor);
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
}
