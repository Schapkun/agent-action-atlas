
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface InvoicePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewHTML: string;
}

export const InvoicePreviewDialog = ({ open, onOpenChange, previewHTML }: InvoicePreviewDialogProps) => {
  // Create A4-formatted HTML content with proper scaling
  const getA4FormattedContent = (content: string) => {
    // Add A4 specific CSS to the existing content
    const a4Content = content.replace(
      /<style[^>]*>([\s\S]*?)<\/style>/i,
      (match, styles) => {
        return `<style>
          ${styles}
          
          /* A4 Preview CSS */
          html, body {
            margin: 0;
            padding: 20px;
            background: white;
            font-family: Arial, sans-serif;
            line-height: 1.4;
            width: 210mm;
            min-height: 297mm;
            box-sizing: border-box;
          }
          
          @page {
            size: A4;
            margin: 20mm;
          }
          
          @media print {
            body { 
              padding: 0; 
              margin: 0;
            }
          }
          
          /* Ensure content fits A4 */
          .container, .document-container {
            max-width: 170mm;
            margin: 0 auto;
          }
          
          /* Table styling for better A4 fit */
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 12px;
          }
          
          th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          
          /* Header and footer styling */
          .header, .footer {
            margin-bottom: 20px;
          }
          
          /* Company info styling */
          .company-info {
            margin-bottom: 30px;
            font-size: 14px;
          }
          
          /* Client info styling */
          .client-info {
            margin-bottom: 30px;
            font-size: 14px;
          }
          
          /* Invoice details styling */
          .invoice-details {
            margin-bottom: 30px;
            font-size: 14px;
          }
          
          /* Totals styling */
          .totals {
            margin-top: 20px;
            text-align: right;
            font-size: 14px;
          }
        </style>`;
      }
    );

    // If no style tag exists, add one
    if (!content.includes('<style')) {
      const styleTag = `
        <style>
          html, body {
            margin: 0;
            padding: 20px;
            background: white;
            font-family: Arial, sans-serif;
            line-height: 1.4;
            width: 210mm;
            min-height: 297mm;
            box-sizing: border-box;
          }
          
          @page {
            size: A4;
            margin: 20mm;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 12px;
          }
          
          th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
        </style>
      `;
      
      if (content.includes('<head>')) {
        return content.replace('<head>', `<head>${styleTag}`);
      } else {
        return `${styleTag}${content}`;
      }
    }

    return a4Content;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[90vw] h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Factuur Voorbeeld</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden bg-gray-100 p-4 rounded-lg min-h-0">
          <div 
            className="bg-white mx-auto shadow-lg h-full overflow-auto"
            style={{
              aspectRatio: '210/297', // A4 ratio
              maxWidth: '600px',
              width: '100%'
            }}
          >
            <iframe
              srcDoc={getA4FormattedContent(previewHTML)}
              className="w-full h-full border-0 rounded-sm"
              title="Invoice Preview"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
