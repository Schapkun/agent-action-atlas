
import jsPDF from 'jspdf';
import { VisualTemplateData } from '../types/VisualTemplate';

export class PDFGenerator {
  private doc: jsPDF;
  
  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
  }

  generateFromTemplate(templateData: VisualTemplateData): jsPDF {
    const { companyInfo, styling, documentType } = templateData;
    
    // Set font based on template
    this.doc.setFont('helvetica');
    
    // Company header
    this.doc.setFontSize(20);
    const rgb = this.hexToRgb(styling.primaryColor);
    this.doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    this.doc.text(companyInfo.name || 'Uw Bedrijf', 20, 30);
    
    // Company details
    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 100, 100);
    let yPos = 40;
    
    if (companyInfo.address) {
      this.doc.text(companyInfo.address, 20, yPos);
      yPos += 5;
    }
    
    if (companyInfo.postalCode && companyInfo.city) {
      this.doc.text(`${companyInfo.postalCode} ${companyInfo.city}`, 20, yPos);
      yPos += 5;
    }
    
    if (companyInfo.phone) {
      this.doc.text(`Tel: ${companyInfo.phone}`, 20, yPos);
      yPos += 5;
    }
    
    if (companyInfo.email) {
      this.doc.text(`Email: ${companyInfo.email}`, 20, yPos);
      yPos += 5;
    }

    // Document title
    this.doc.setFontSize(16);
    const titleRgb = this.hexToRgb(styling.primaryColor);
    this.doc.setTextColor(titleRgb[0], titleRgb[1], titleRgb[2]);
    const docTitle = documentType === 'invoice' ? 'FACTUUR' : 
                    documentType === 'quote' ? 'OFFERTE' : 
                    documentType === 'letter' ? 'BRIEF' : 'DOCUMENT';
    this.doc.text(docTitle, 20, yPos + 15);
    
    yPos += 30;

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

    // Table
    yPos += 20;
    this.drawTable(yPos, styling.primaryColor);

    return this.doc;
  }

  private drawTable(startY: number, primaryColor: string) {
    const tableHeaders = ['Beschrijving', 'Aantal', 'Prijs', 'Totaal'];
    const tableData = [
      ['Consultancy diensten', '10', '€ 75,00', '€ 750,00'],
      ['Reiskosten', '1', '€ 50,00', '€ 50,00']
    ];

    // Table headers
    const headerRgb = this.hexToRgb(primaryColor);
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

    // Totals
    rowY += 5;
    this.doc.text('Subtotaal:', 140, rowY);
    this.doc.text('€ 800,00', 170, rowY);
    rowY += 5;
    this.doc.text('BTW (21%):', 140, rowY);
    this.doc.text('€ 168,00', 170, rowY);
    rowY += 8;
    
    this.doc.setFontSize(12);
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
