
import jsPDF from 'jspdf';
import { VisualTemplateData } from '../types/VisualTemplate';
import { getLayoutSpecificStyles } from '../../../utils/layoutStyles';
import { PDFHeaderGenerator } from './PDFHeaderGenerator';
import { PDFContentGenerator } from './PDFContentGenerator';
import { PDFTableGenerator } from './PDFTableGenerator';
import { PDFFooterGenerator } from './PDFFooterGenerator';

export class PDFGenerator {
  private doc: jsPDF;
  private pageWidth = 210; // A4 width in mm
  private pageHeight = 297; // A4 height in mm
  private margins = 15; // 15mm margins
  private contentWidth = 180; // 210 - 30 (15mm on each side)
  
  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
  }

  generateFromTemplate(templateData: VisualTemplateData): jsPDF {
    const { companyInfo, styling, documentType, layout } = templateData;
    
    // DEBUG: Log actual layout being used
    console.log('🎨 PDF Generator - Layout used:', layout);
    console.log('🎨 PDF Generator - Styling:', styling);
    
    // FORCE business-green layout if undefined or incorrect
    const actualLayout = layout || 'business-green';
    console.log('🎨 PDF Generator - Forced layout:', actualLayout);
    
    // Get layout-specific styles - FORCE green colors
    const layoutStyles = getLayoutSpecificStyles(actualLayout);
    
    // OVERRIDE to ensure green color is used (fix for blue showing up)
    if (actualLayout === 'business-green' || !layout) {
      layoutStyles.primaryColor = '#059669'; // Force business green
      layoutStyles.secondaryColor = '#10b981'; // Force business green secondary
      console.log('🟢 PDF Generator - FORCED green colors:', layoutStyles.primaryColor);
    }
    
    // Set base font
    this.doc.setFont('helvetica');
    
    // Initialize generators
    const headerGenerator = new PDFHeaderGenerator(this.doc, this.margins, this.contentWidth, this.pageWidth);
    const contentGenerator = new PDFContentGenerator(this.doc, this.margins, this.contentWidth);
    const tableGenerator = new PDFTableGenerator(this.doc, this.margins, this.contentWidth);
    const footerGenerator = new PDFFooterGenerator(this.doc, this.margins, this.contentWidth, this.pageHeight);
    
    // Generate sections
    headerGenerator.generateHeader(companyInfo, styling, layoutStyles);
    contentGenerator.generateContent(templateData, layoutStyles);
    tableGenerator.generateTable(layoutStyles);
    footerGenerator.generateFooter();

    return this.doc;
  }

  download(filename: string = 'document.pdf') {
    this.doc.save(filename);
  }
}
