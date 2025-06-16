
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface InvoicePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewHTML: string;
}

export const InvoicePreviewDialog = ({ open, onOpenChange, previewHTML }: InvoicePreviewDialogProps) => {
  // Create A4-formatted HTML content with proper scaling to fit popup
  const getA4FormattedContent = (content: string) => {
    // Add A4 specific CSS to the existing content with scaling
    const a4Content = content.replace(
      /<style[^>]*>([\s\S]*?)<\/style>/i,
      (match, styles) => {
        return `<style>
          ${styles}
          
          /* A4 Preview CSS - Scaled to fit popup */
          html, body {
            margin: 0;
            padding: 15px;
            background: white;
            font-family: Arial, sans-serif;
            line-height: 1.3;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            overflow: hidden;
            transform: scale(0.75);
            transform-origin: top left;
          }
          
          .container, .document-container {
            max-width: 100%;
            margin: 0 auto;
            padding: 0;
          }
          
          /* Table styling for better fit */
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0;
            font-size: 11px;
          }
          
          th, td {
            padding: 6px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          
          /* Header and footer styling */
          .header, .footer {
            margin-bottom: 15px;
          }
          
          /* Company info styling */
          .company-info {
            margin-bottom: 20px;
            font-size: 12px;
          }
          
          /* Client info styling */
          .client-info {
            margin-bottom: 20px;
            font-size: 12px;
          }
          
          /* Invoice details styling */
          .invoice-details {
            margin-bottom: 20px;
            font-size: 12px;
          }
          
          /* Totals styling */
          .totals {
            margin-top: 15px;
            text-align: right;
            font-size: 12px;
          }
          
          /* Scale down everything to fit */
          * {
            max-width: 100% !important;
          }
          
          h1, h2, h3 {
            font-size: 16px !important;
            margin: 10px 0 !important;
          }
          
          p {
            font-size: 11px !important;
            margin: 5px 0 !important;
          }
        </style>`;
      }
    );

    // If no style tag exists, add one with scaling
    if (!content.includes('<style')) {
      const styleTag = `
        <style>
          html, body {
            margin: 0;
            padding: 15px;
            background: white;
            font-family: Arial, sans-serif;
            line-height: 1.3;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            overflow: hidden;
            transform: scale(0.75);
            transform-origin: top left;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0;
            font-size: 11px;
          }
          
          th, td {
            padding: 6px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          
          h1, h2, h3 {
            font-size: 16px !important;
            margin: 10px 0 !important;
          }
          
          p {
            font-size: 11px !important;
            margin: 5px 0 !important;
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
        <div className="flex-1 bg-gray-100 p-4 rounded-lg min-h-0 overflow-hidden">
          <div 
            className="bg-white mx-auto shadow-lg h-full"
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
              style={{ overflow: 'hidden' }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
