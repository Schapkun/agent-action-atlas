
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { DocumentTemplate } from '@/hooks/useDocumentTemplatesCreate';

interface InvoicePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  invoiceData: any;
  selectedTemplate: DocumentTemplate | null;
}

export const InvoicePreviewDialog = ({ open, onClose, invoiceData, selectedTemplate }: InvoicePreviewDialogProps) => {
  // Create enhanced A4-formatted HTML content with proper page breaks and content management
  const getA4FormattedContent = (content: string) => {
    const a4Styles = `
      <style>
        /* Reset and base styling */
        html, body {
          margin: 0;
          padding: 0;
          background: #f8f9fa;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          width: 100%;
          height: 100vh;
          overflow: auto;
        }
        
        /* A4 page container with precise dimensions */
        .a4-page {
          width: 210mm;
          min-height: 297mm;
          max-height: 297mm;
          max-width: 100%;
          margin: 20px auto;
          background: white;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          position: relative;
          overflow: hidden;
          page-break-after: always;
        }
        
        /* Page content with proper A4 margins and overflow control */
        .page-content {
          padding: 20mm 20mm 40mm 20mm; /* Extra bottom padding for footer */
          width: calc(100% - 40mm);
          height: calc(297mm - 60mm); /* Reserve space for footer */
          box-sizing: border-box;
          overflow: hidden;
          position: relative;
        }
        
        /* Content area that respects footer */
        .content-area {
          height: calc(100% - 40mm);
          overflow: hidden;
        }
        
        /* Footer positioning */
        .footer, .document-footer {
          position: absolute;
          bottom: 20mm;
          left: 20mm;
          right: 20mm;
          padding-top: 16px;
          border-top: 1px solid #e9ecef;
          font-size: 12px;
          color: #6c757d;
          background: white;
        }
        
        /* Enhanced typography */
        .container, .document-container {
          max-width: 100%;
          margin: 0;
          padding: 0;
          height: 100%;
        }
        
        /* Table styling with better spacing */
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
          font-size: 14px;
          background: white;
          page-break-inside: avoid;
        }
        
        th {
          background: #f8f9fa;
          font-weight: 600;
          padding: 12px 8px;
          text-align: left;
          border-bottom: 2px solid #e9ecef;
          color: #495057;
        }
        
        td {
          padding: 10px 8px;
          text-align: left;
          border-bottom: 1px solid #e9ecef;
          color: #212529;
        }
        
        tr:hover {
          background: #f8f9fa;
        }
        
        /* Header styling */
        .header, .document-header {
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e9ecef;
        }
        
        /* Company and client info styling */
        .company-info, .client-info, .invoice-details {
          margin-bottom: 20px;
          font-size: 14px;
          line-height: 1.5;
          page-break-inside: avoid;
        }
        
        /* Totals section */
        .totals, .invoice-totals {
          margin-top: 24px;
          text-align: right;
          font-size: 14px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 6px;
          page-break-inside: avoid;
        }
        
        /* Typography enhancements */
        h1, h2, h3 {
          color: #212529;
          font-weight: 600;
          margin: 20px 0 12px 0;
          line-height: 1.3;
          page-break-after: avoid;
        }
        
        h1 { font-size: 24px; }
        h2 { font-size: 20px; }
        h3 { font-size: 16px; }
        
        p {
          font-size: 14px;
          margin: 8px 0;
          color: #495057;
          orphans: 2;
          widows: 2;
        }
        
        /* Status and emphasis */
        .status, .emphasis {
          font-weight: 600;
          color: #0056b3;
        }
        
        /* Preview message styling */
        .preview-message, .preview-error {
          text-align: center;
          padding: 40px 20px;
          font-size: 16px;
          color: #6c757d;
          background: #f8f9fa;
          border-radius: 8px;
          margin: 20px;
        }
        
        .preview-error {
          color: #dc3545;
          background: #f8d7da;
          border: 1px solid #f5c6cb;
        }
        
        /* Prevent content overflow */
        * {
          box-sizing: border-box;
        }
        
        /* Hide overflow content that would go past the footer */
        .page-content > *:last-child {
          margin-bottom: 0;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .a4-page {
            margin: 10px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          }
          
          .page-content {
            padding: 15mm;
            width: calc(100% - 30mm);
          }
          
          table, th, td {
            font-size: 12px;
          }
          
          h1 { font-size: 20px; }
          h2 { font-size: 18px; }
          h3 { font-size: 14px; }
        }
        
        /* Print optimization */
        @media print {
          .a4-page {
            margin: 0;
            box-shadow: none;
            border-radius: 0;
            max-height: none;
          }
          
          body {
            background: white;
          }
          
          .footer, .document-footer {
            position: fixed;
            bottom: 0;
          }
        }
      </style>
    `;
    
    // Create basic invoice HTML from the template and data
    const invoiceHTML = selectedTemplate?.html_content || `
      <div class="invoice-container">
        <h1>Factuur ${invoiceData.invoice_number}</h1>
        <div class="invoice-details">
          <p><strong>Datum:</strong> ${new Date(invoiceData.invoice_date).toLocaleDateString('nl-NL')}</p>
          <p><strong>Vervaldatum:</strong> ${new Date(invoiceData.due_date).toLocaleDateString('nl-NL')}</p>
        </div>
        <div class="client-info">
          <h3>Klant:</h3>
          <p>${invoiceData.client_name}</p>
          ${invoiceData.client_email ? `<p>${invoiceData.client_email}</p>` : ''}
          ${invoiceData.client_address ? `<p>${invoiceData.client_address}</p>` : ''}
          ${invoiceData.client_postal_code && invoiceData.client_city ? `<p>${invoiceData.client_postal_code} ${invoiceData.client_city}</p>` : ''}
        </div>
        <div class="invoice-totals">
          <p><strong>Subtotaal:</strong> €${Number(invoiceData.subtotal || 0).toFixed(2)}</p>
          <p><strong>BTW:</strong> €${Number(invoiceData.vat_amount || 0).toFixed(2)}</p>
          <p><strong>Totaal:</strong> €${Number(invoiceData.total_amount || 0).toFixed(2)}</p>
        </div>
      </div>
    `;
    
    // Wrap content in A4 page structure with content area
    const wrappedContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Factuur Voorbeeld</title>
        ${a4Styles}
      </head>
      <body>
        <div class="a4-page">
          <div class="page-content">
            <div class="content-area">
              ${invoiceHTML}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return wrappedContent;
  };

  const previewHTML = getA4FormattedContent('');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 px-6 py-4 border-b bg-white">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Factuur Voorbeeld
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 bg-gray-50 p-6 min-h-0 overflow-auto">
          <div className="max-w-full mx-auto">
            <iframe
              srcDoc={previewHTML}
              className="w-full h-full border-0 rounded-lg shadow-sm"
              title="Invoice Preview"
              style={{ 
                minHeight: '800px',
                backgroundColor: 'white'
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
