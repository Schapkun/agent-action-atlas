
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
    // EXACT CSS padding conversion: 60px → 15.84mm (was 10mm)
    let yPos = this.margins + PDFUtils.pxToMm(60); // Exact CSS padding match
    
    // Header background/border with EXACT preview styling
    const headerHeight = PDFUtils.pxToMm(100); // Match CSS header height
    
    if (styling.headerStyle === 'colored') {
      const rgb = PDFUtils.hexToRgb(layoutStyles.primaryColor);
      this.doc.setFillColor(rgb[0], rgb[1], rgb[2]);
      this.doc.rect(this.margins, this.margins, this.contentWidth, headerHeight, 'F');
      this.doc.setTextColor(255, 255, 255);
    } else if (styling.headerStyle === 'bordered') {
      const rgb = PDFUtils.hexToRgb(layoutStyles.primaryColor);
      // EXACT CSS border: 2px → 0.528mm (not 1mm!)
      this.doc.setLineWidth(0.528);
      this.doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
      this.doc.rect(this.margins, this.margins, this.contentWidth, headerHeight);
      this.doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    } else {
      const rgb = PDFUtils.hexToRgb(layoutStyles.primaryColor);
      this.doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    }
    
    // Company name with EXACT positioning
    this.doc.setFontSize(20);
    let nameX = this.margins + PDFUtils.pxToMm(16); // CSS padding-left: 16px
    let detailsX = this.margins + PDFUtils.pxToMm(16);
    let align: 'left' | 'center' | 'right' = 'left';
    
    switch (styling.logoPosition) {
      case 'center':
        nameX = this.pageWidth / 2;
        detailsX = this.pageWidth / 2;
        align = 'center';
        break;
      case 'right':
        nameX = this.pageWidth - this.margins - PDFUtils.pxToMm(16);
        detailsX = this.pageWidth - this.margins - PDFUtils.pxToMm(16);
        align = 'right';
        break;
    }
    
    this.doc.text(companyInfo.name || 'Uw Bedrijf', nameX, yPos, { align });
    
    // Company details with EXACT CSS spacing conversion
    const lineHeight = PDFUtils.getLineSpacing(10); // 10pt font with 1.4 line-height
    yPos += PDFUtils.pxToMm(32); // CSS margin-bottom converted
    this.doc.setFontSize(10);
    
    if (styling.headerStyle === 'colored') {
      this.doc.setTextColor(255, 255, 255);
    } else {
      this.doc.setTextColor(120, 120, 120);
    }
    
    // EXACT spacing match with CSS space-y-1 (4px = 1.056mm)
    const spacingIncrement = PDFUtils.pxToMm(4);
    
    if (companyInfo.address) {
      this.doc.text(companyInfo.address, detailsX, yPos, { align });
      yPos += spacingIncrement;
    }
    
    if (companyInfo.postalCode && companyInfo.city) {
      this.doc.text(`${companyInfo.postalCode} ${companyInfo.city}`, detailsX, yPos, { align });
      yPos += spacingIncrement;
    }
    
    if (companyInfo.phone) {
      this.doc.text(`Tel: ${companyInfo.phone}`, detailsX, yPos, { align });
      yPos += spacingIncrement;
    }
    
    if (companyInfo.email) {
      this.doc.text(`Email: ${companyInfo.email}`, detailsX, yPos, { align });
      yPos += spacingIncrement;
    }
    
    if (companyInfo.website) {
      this.doc.text(`Web: ${companyInfo.website}`, detailsX, yPos, { align });
    }
  }
}
