
export class HTMLToPDFService {
  static async generatePDF(html: string, filename: string = 'document.pdf'): Promise<void> {
    try {
      // For now, we'll use a browser-based approach
      // In production, this would be handled by a server-side service
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Popup geblokkeerd. Sta popups toe voor PDF generatie.');
      }

      printWindow.document.write(html);
      printWindow.document.close();

      // Add print styles
      const printStyles = `
        <style>
          @media print {
            @page {
              size: A4;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              background: white !important;
            }
            .document-container {
              box-shadow: none !important;
              border: none !important;
            }
          }
        </style>
      `;
      
      printWindow.document.head.insertAdjacentHTML('beforeend', printStyles);

      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      };

      console.log('✅ PDF generatie gestart via browser print');
      
    } catch (error) {
      console.error('❌ PDF generatie fout:', error);
      throw error;
    }
  }

  // Future: Server-side PDF generation
  static async generateServerPDF(html: string): Promise<Blob> {
    // This would call a server endpoint that uses Puppeteer
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ html })
    });

    if (!response.ok) {
      throw new Error('PDF generatie gefaald');
    }

    return response.blob();
  }
}
