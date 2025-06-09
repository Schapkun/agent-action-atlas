
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
}
