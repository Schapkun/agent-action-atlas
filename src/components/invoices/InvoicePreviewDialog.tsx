
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface InvoicePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewHTML: string;
}

export const InvoicePreviewDialog = ({ open, onOpenChange, previewHTML }: InvoicePreviewDialogProps) => {
  // Create enhanced A4-formatted HTML content with professional styling
  const getA4FormattedContent = (content: string) => {
    // Enhanced A4 styling with better visual presentation
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
          overflow: hidden;
        }
        
        /* A4 page container */
        .a4-page {
          width: 210mm;
          min-height: 297mm;
          max-width: 100%;
          margin: 20px auto;
          background: white;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          position: relative;
          overflow: hidden;
        }
        
        /* Page content with proper A4 margins */
        .page-content {
          padding: 20mm;
          width: calc(100% - 40mm);
          min-height: calc(297mm - 40mm);
          box-sizing: border-box;
        }
        
        /* Enhanced typography */
        .container, .document-container {
          max-width: 100%;
          margin: 0;
          padding: 0;
        }
        
        /* Table styling */
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
          font-size: 14px;
          background: white;
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
        }
        
        /* Totals section */
        .totals, .invoice-totals {
          margin-top: 24px;
          text-align: right;
          font-size: 14px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 6px;
        }
        
        /* Footer styling */
        .footer, .document-footer {
          margin-top: 32px;
          padding-top: 16px;
          border-top: 1px solid #e9ecef;
          font-size: 12px;
          color: #6c757d;
        }
        
        /* Typography enhancements */
        h1, h2, h3 {
          color: #212529;
          font-weight: 600;
          margin: 20px 0 12px 0;
          line-height: 1.3;
        }
        
        h1 { font-size: 24px; }
        h2 { font-size: 20px; }
        h3 { font-size: 16px; }
        
        p {
          font-size: 14px;
          margin: 8px 0;
          color: #495057;
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
          }
          
          body {
            background: white;
          }
        }
      </style>
    `;
    
    // Wrap content in A4 page structure
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
            ${content}
          </div>
        </div>
      </body>
      </html>
    `;

    return wrappedContent;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 px-6 py-4 border-b bg-white">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Factuur Voorbeeld
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 bg-gray-50 p-6 min-h-0 overflow-auto">
          <div className="max-w-full mx-auto">
            <iframe
              srcDoc={getA4FormattedContent(previewHTML)}
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
