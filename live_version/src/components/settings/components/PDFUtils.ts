
export class PDFUtils {
  static hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 0, 0];
  }

  static getDocumentTitle(documentType: string): string {
    switch (documentType) {
      case 'invoice':
        return 'FACTUUR';
      case 'quote':
        return 'OFFERTE';
      case 'letter':
        return 'BRIEF';
      default:
        return 'DOCUMENT';
    }
  }

  static getCurrentDate(): string {
    return new Date().toLocaleDateString('nl-NL');
  }

  static getFutureDate(daysFromNow: number): string {
    return new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL');
  }

  // NEW: Exact CSS-to-PDF conversion utilities
  static pxToMm(pixels: number): number {
    // A4 width: 794px = 210mm, so 1px = 0.264mm
    return pixels * 0.264;
  }

  static cssToJsPDFSpacing(cssValue: string | number): number {
    if (typeof cssValue === 'number') return this.pxToMm(cssValue);
    
    // Convert CSS values like "8px", "1rem", etc to mm
    if (cssValue.includes('px')) {
      return this.pxToMm(parseInt(cssValue));
    }
    return 8; // fallback
  }

  // CSS line-height 1.4 to PDF spacing conversion
  static getLineSpacing(fontSize: number): number {
    return fontSize * 1.4 * 0.264; // Convert CSS line-height to mm
  }
}
