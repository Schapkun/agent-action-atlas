import jsPDF from 'jspdf';
import { VisualTemplateData } from '../types/VisualTemplate';
import { getLayoutSpecificStyles, getLayoutFont } from '../../../utils/layoutStyles';

export class PDFGenerator {
  private doc: jsPDF;
  
  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
  }

  generateFromTemplate(templateData: VisualTemplateData): jsPDF {
    const { companyInfo, styling, documentType, layout } = templateData;
    
    // Get layout-specific styles using shared utility
    const layoutStyles = getLayoutSpecificStyles(layout || 'business-green');
    const layoutFont = getLayoutFont(layout || 'business-green');
    
    // Set font based on layout
    this.doc.setFont('helvetica');
    
    // Apply layout-specific header styling with logo positioning
    this.generateLayoutSpecificHeader(companyInfo, styling, layoutStyles, layoutFont);
    
    // Document content with layout-aware styling
    this.generateDocumentContent(templateData, layoutStyles);
    
    // Table with consistent styling
    this.drawLayoutAwareTable(layoutStyles);

    return this.doc;
  }

  private generateLayoutSpecificHeader(companyInfo: any, styling: any, layoutStyles: any, layoutFont: string) {
    let yPos = 30;
    const pageWidth = 210; // A4 width in mm
    
    // Apply header styling based on headerStyle
    if (styling.headerStyle === 'colored') {
      const rgb = this.hexToRgb(layoutStyles.primaryColor);
      this.doc.setFillColor(rgb[0], rgb[1], rgb[2]);
      this.doc.rect(15, 15, 180, 30, 'F');
      this.doc.setTextColor(255, 255, 255);
      yPos = 35;
    } else if (styling.headerStyle === 'bordered') {
      const rgb = this.hexToRgb(layoutStyles.primaryColor);
      this.doc.setLineWidth(2);
      this.doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
      this.doc.rect(15, 15, 180, 30);
      this.doc.setTextColor(rgb[0], rgb[1], rgb[2]);
      yPos = 35;
    } else {
      const rgb = this.hexToRgb(layoutStyles.primaryColor);
      this.doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    }
    
    // Company name with logo positioning
    this.doc.setFontSize(20);
    
    let companyNameX = 20;
    let detailsX = 20;
    let detailsAlign = 'left';
    
    // Apply logo positioning logic
    switch (styling.logoPosition) {
      case 'center':
        companyNameX = pageWidth / 2;
        detailsX = pageWidth / 2;
        detailsAlign = 'center';
        this.doc.text(companyInfo.name || 'Uw Bedrijf', companyNameX, yPos, { align: 'center' });
        break;
      case 'right':
        companyNameX = pageWidth - 20;
        detailsX = pageWidth - 20;
        detailsAlign = 'right';
        this.doc.text(companyInfo.name || 'Uw Bedrijf', companyNameX, yPos, { align: 'right' });
        break;
      case 'left':
      default:
        this.doc.text(companyInfo.name || 'Uw Bedrijf', companyNameX, yPos);
        break;
    }
    
    yPos += 15;
    
    // Layout-specific header pattern
    switch(layoutStyles.headerPattern) {
      case 'gradient-header':
      case 'corporate-header':
        if (styling.headerStyle !== 'colored') {
          const rgb = this.hexToRgb(layoutStyles.primaryColor);
          this.doc.setFillColor(rgb[0], rgb[1], rgb[2]);
          this.doc.rect(15, 15, 180, 25, 'F');
          this.doc.setTextColor(255, 255, 255);
          if (styling.logoPosition === 'center') {
            this.doc.text(companyInfo.name || 'Uw Bedrijf', pageWidth / 2, 30, { align: 'center' });
          } else if (styling.logoPosition === 'right') {
            this.doc.text(companyInfo.name || 'Uw Bedrijf', pageWidth - 20, 30, { align: 'right' });
          } else {
            this.doc.text(companyInfo.name || 'Uw Bedrijf', 20, 30);
          }
          yPos = 50;
        }
        break;
      
      case 'business-header':
        // Left border accent
        const rgb = this.hexToRgb(layoutStyles.primaryColor);
        this.doc.setLineWidth(3);
        this.doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
        this.doc.line(15, 20, 15, 40);
        break;
    }
    
    // Company details with proper positioning
    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 100, 100);
    
    if (companyInfo.address) {
      if (detailsAlign === 'center') {
        this.doc.text(companyInfo.address, detailsX, yPos, { align: 'center' });
      } else if (detailsAlign === 'right') {
        this.doc.text(companyInfo.address, detailsX, yPos, { align: 'right' });
      } else {
        this.doc.text(companyInfo.address, detailsX, yPos);
      }
      yPos += 5;
    }
    
    if (companyInfo.postalCode && companyInfo.city) {
      const addressLine = `${companyInfo.postalCode} ${companyInfo.city}`;
      if (detailsAlign === 'center') {
        this.doc.text(addressLine, detailsX, yPos, { align: 'center' });
      } else if (detailsAlign === 'right') {
        this.doc.text(addressLine, detailsX, yPos, { align: 'right' });
      } else {
        this.doc.text(addressLine, detailsX, yPos);
      }
      yPos += 5;
    }
    
    if (companyInfo.phone) {
      const phoneLine = `Tel: ${companyInfo.phone}`;
      if (detailsAlign === 'center') {
        this.doc.text(phoneLine, detailsX, yPos, { align: 'center' });
      } else if (detailsAlign === 'right') {
        this.doc.text(phoneLine, detailsX, yPos, { align: 'right' });
      } else {
        this.doc.text(phoneLine, detailsX, yPos);
      }
      yPos += 5;
    }
    
    if (companyInfo.email) {
      const emailLine = `Email: ${companyInfo.email}`;
      if (detailsAlign === 'center') {
        this.doc.text(emailLine, detailsX, yPos, { align: 'center' });
      } else if (detailsAlign === 'right') {
        this.doc.text(emailLine, detailsX, yPos, { align: 'right' });
      } else {
        this.doc.text(emailLine, detailsX, yPos);
      }
      yPos += 5;
    }
  }

  private generateDocumentContent(templateData: VisualTemplateData, layoutStyles: any) {
    const { documentType } = templateData;
    let yPos = 80;

    // Document title with layout-specific styling
    this.doc.setFontSize(16);
    const titleRgb = this.hexToRgb(layoutStyles.primaryColor);
    this.doc.setTextColor(titleRgb[0], titleRgb[1], titleRgb[2]);
    const docTitle = documentType === 'invoice' ? 'FACTUUR' : 
                    documentType === 'quote' ? 'OFFERTE' : 
                    documentType === 'letter' ? 'BRIEF' : 'DOCUMENT';
    this.doc.text(docTitle, 20, yPos);
    
    yPos += 20;

    // Invoice details
    this.doc.setFontSize(12);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('Factuurgegevens:', 20, yPos);
    
    this.doc.setFontSize(10);
    yPos += 8;
    this.doc.text('Factuurnummer: 2024-001', 20, yPos);
    yPos += 5;
    this.doc.text(`Factuurdatum: ${new Date().toLocaleDateString('nl-NL')}`, 20, yPos);
    yPos += 5;
    this.doc.text(`Vervaldatum: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL')}`, 20, yPos);
    
    // Customer details
    yPos += 15;
    this.doc.setFontSize(12);
    this.doc.text('Klantgegevens:', 20, yPos);
    
    this.doc.setFontSize(10);
    yPos += 8;
    this.doc.text('Voorbeeld Klant B.V.', 20, yPos);
    yPos += 5;
    this.doc.text('Voorbeeldstraat 123', 20, yPos);
    yPos += 5;
    this.doc.text('1234 AB Amsterdam', 20, yPos);
  }

  private drawLayoutAwareTable(layoutStyles: any) {
    const startY = 160;
    const tableHeaders = ['Beschrijving', 'Aantal', 'Prijs', 'Totaal'];
    const tableData = [
      ['Consultancy diensten', '10', '€ 75,00', '€ 750,00'],
      ['Reiskosten', '1', '€ 50,00', '€ 50,00']
    ];

    // Table headers with layout-specific styling
    const headerRgb = this.hexToRgb(layoutStyles.primaryColor);
    this.doc.setFillColor(headerRgb[0], headerRgb[1], headerRgb[2]);
    this.doc.rect(20, startY, 170, 8, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(10);
    this.doc.text('Beschrijving', 22, startY + 5);
    this.doc.text('Aantal', 120, startY + 5);
    this.doc.text('Prijs', 140, startY + 5);
    this.doc.text('Totaal', 170, startY + 5);

    // Table rows
    this.doc.setTextColor(0, 0, 0);
    let rowY = startY + 10;
    
    tableData.forEach((row) => {
      this.doc.text(row[0], 22, rowY);
      this.doc.text(row[1], 120, rowY);
      this.doc.text(row[2], 140, rowY);
      this.doc.text(row[3], 170, rowY);
      rowY += 8;
    });

    // Totals with layout-specific accent
    rowY += 5;
    this.doc.text('Subtotaal:', 140, rowY);
    this.doc.text('€ 800,00', 170, rowY);
    rowY += 5;
    this.doc.text('BTW (21%):', 140, rowY);
    this.doc.text('€ 168,00', 170, rowY);
    rowY += 8;
    
    this.doc.setFontSize(12);
    const totalRgb = this.hexToRgb(layoutStyles.primaryColor);
    this.doc.setTextColor(totalRgb[0], totalRgb[1], totalRgb[2]);
    this.doc.text('Totaal:', 140, rowY);
    this.doc.text('€ 968,00', 170, rowY);
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
