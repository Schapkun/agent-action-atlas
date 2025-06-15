
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface InvoicePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewHTML: string;
}

export const InvoicePreviewDialog = ({ open, onOpenChange, previewHTML }: InvoicePreviewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] w-[85vw] flex flex-col">
        <DialogHeader>
          <DialogTitle>Factuur Voorbeeld</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden bg-gray-100 p-4 rounded-lg">
          <div className="bg-white mx-auto shadow-lg" style={{ width: '210mm', minHeight: '297mm', transform: 'scale(0.7)', transformOrigin: 'top center' }}>
            <iframe
              srcDoc={previewHTML}
              className="w-full h-full border-0"
              style={{ width: '210mm', height: '297mm' }}
              title="Invoice Preview"
              sandbox="allow-same-origin"
              onLoad={(e) => {
                const iframe = e.target as HTMLIFrameElement;
                try {
                  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                  if (iframeDoc) {
                    // Ensure the iframe content is properly styled
                    const style = iframeDoc.createElement('style');
                    style.textContent = `
                      html, body {
                        margin: 0;
                        padding: 0;
                        width: 100%;
                        height: 100%;
                        font-family: Arial, sans-serif;
                      }
                    `;
                    iframeDoc.head.appendChild(style);
                  }
                } catch (error) {
                  console.log('Could not access iframe content:', error);
                }
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
