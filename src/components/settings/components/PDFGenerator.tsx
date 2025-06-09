
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
    
    // ENHANCED DEBUGGING: Track the entire color chain
    console.log('🔍 PDF Generator - Complete Debug Chain:');
    console.log('  - Raw layout parameter:', layout);
    console.log('  - Template data layout:', templateData.layout);
    console.log('  - Styling object:', styling);
    console.log('  - Company info:', companyInfo);
    
    // FORCE business-green layout with enhanced fallback
    const actualLayout = layout || 'business-green';
    console.log('  - Resolved layout:', actualLayout);
    
    // Get layout-specific styles with debugging
    const layoutStyles = getLayoutSpecificStyles(actualLayout);
    console.log('  - Layout styles received:', layoutStyles);
    
    // TRIPLE FORCE: Ensure green color is ALWAYS used
    if (actualLayout === 'business-green' || !layout) {
      layoutStyles.primaryColor = '#059669'; // Business green
      layoutStyles.secondaryColor = '#10b981';
      console.log('🟢 FORCED GREEN - Primary:', layoutStyles.primaryColor);
      console.log('🟢 FORCED GREEN - Secondary:', layoutStyles.secondaryColor);
    }
    
    // FINAL VERIFICATION: Log the exact color that will be used
    console.log('✅ FINAL COLOR TO BE USED:', layoutStyles.primaryColor);
    
    // Set base font
    this.doc.setFont('helvetica');
    
    // Initialize generators with EXACT measurements
    const headerGenerator = new PDFHeaderGenerator(this.doc, this.margins, this.contentWidth, this.pageWidth);
    const contentGenerator = new PDFContentGenerator(this.doc, this.margins, this.contentWidth);
    const tableGenerator = new PDFTableGenerator(this.doc, this.margins, this.contentWidth);
    const footerGenerator = new PDFFooterGenerator(this.doc, this.margins, this.contentWidth, this.pageHeight);
    
    // Generate sections with exact positioning
    headerGenerator.generateHeader(companyInfo, styling, layoutStyles);
    contentGenerator.generateContent(templateData, layoutStyles);
    tableGenerator.generateTable(layoutStyles);
    footerGenerator.generateFooter();

    console.log('📄 PDF generation completed with exact CSS-to-PDF conversion');
    return this.doc;
  }

  download(filename: string = 'document.pdf') {
    this.doc.save(filename);
  }
}
