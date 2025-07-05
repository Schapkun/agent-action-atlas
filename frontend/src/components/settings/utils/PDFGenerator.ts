
import jsPDF from 'jspdf';

export class DocumentPDFGenerator {
  static generateFromHTML(htmlContent: string, documentName: string = 'document'): void {
    // Create a temporary iframe to render the HTML
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.width = '210mm'; // A4 width
    iframe.style.height = '297mm'; // A4 height
    document.body.appendChild(iframe);

    if (iframe.contentDocument) {
      iframe.contentDocument.open();
      iframe.contentDocument.write(htmlContent);
      iframe.contentDocument.close();

      // Wait for content to load
      setTimeout(() => {
        try {
          const doc = new jsPDF('p', 'mm', 'a4');
          
          // Get the rendered content
          const content = iframe.contentDocument?.body;
          if (content) {
            // For now, create a basic PDF with the document info
            // In a real implementation, you'd use html2canvas or similar
            doc.setFontSize(16);
            doc.text(documentName, 20, 30);
            
            doc.setFontSize(12);
            doc.text('Document gegenereerd op:', 20, 50);
            doc.text(new Date().toLocaleDateString('nl-NL'), 20, 60);
            
            doc.setFontSize(10);
            doc.text('Dit is een basis PDF export. Voor volledige HTML rendering', 20, 80);
            doc.text('wordt aanbevolen om de HTML rechtstreeks te printen naar PDF.', 20, 90);
            
            // Save the PDF
            doc.save(`${documentName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
          }
        } catch (error) {
          console.error('PDF generation error:', error);
        } finally {
          document.body.removeChild(iframe);
        }
      }, 500);
    }
  }
}
