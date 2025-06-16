
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface InvoicePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewHTML: string;
}

export const InvoicePreviewDialog = ({ open, onOpenChange, previewHTML }: InvoicePreviewDialogProps) => {
  // Create A4-formatted HTML content with proper scaling for preview
  const getA4FormattedContent = (content: string) => {
    // Add A4 specific CSS to the existing content with minimal scaling
    const a4Content = content.replace(
      /<style[^>]*>([\s\S]*?)<\/style>/i,
      (match, styles) => {
        return `<style>
          ${styles}
          
          /* A4 Preview CSS - Minimal scaling for better readability */
          html, body {
            margin: 0;
            padding: 20px;
            background: white;
            font-family: Arial, sans-serif;
            line-height: 1.4;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            overflow: auto;
          }
          
          .container, .document-container {
            max-width: 100%;
            margin: 0 auto;
            padding: 0;
          }
          
          /* Table styling */
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
            font-size: 14px;
          }
          
          th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          
          /* Header and content styling */
          .header, .footer {
            margin-bottom: 20px;
          }
          
          .company-info, .client-info, .invoice-details {
            margin-bottom: 20px;
            font-size: 14px;
          }
          
          .totals {
            margin-top: 20px;
            text-align: right;
            font-size: 14px;
          }
          
          h1, h2, h3 {
            font-size: 18px !important;
            margin: 15px 0 !important;
          }
          
          p {
            font-size: 14px !important;
            margin: 8px 0 !important;
          }
        </style>`;
      }
    );

    // If no style tag exists, add minimal styling
    if (!content.includes('<style')) {
      const styleTag = `
        <style>
          html, body {
            margin: 0;
            padding: 20px;
            background: white;
            font-family: Arial, sans-serif;
            line-height: 1.4;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            overflow: auto;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
            font-size: 14px;
          }
          
          th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          
          h1, h2, h3 {
            font-size: 18px !important;
            margin: 15px 0 !important;
          }
          
          p {
            font-size: 14px !important;
            margin: 8px 0 !important;
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
            className="bg-white mx-auto shadow-lg h-full overflow-hidden"
            style={{
              aspectRatio: '210/297', // A4 ratio
              maxWidth: '700px',
              width: '100%'
            }}
          >
            <iframe
              srcDoc={getA4FormattedContent(previewHTML)}
              className="w-full h-full border-0 rounded-sm"
              title="Invoice Preview"
              style={{ 
                overflow: 'hidden',
                border: 'none'
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
