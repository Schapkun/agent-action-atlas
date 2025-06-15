
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface InvoicePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewHTML: string;
}

export const InvoicePreviewDialog = ({ open, onOpenChange, previewHTML }: InvoicePreviewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] w-[80vw] flex flex-col">
        <DialogHeader>
          <DialogTitle>Factuur Voorbeeld</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <div className="bg-white mx-auto border shadow-lg" style={{ width: '210mm', height: '297mm', transform: 'scale(0.6)', transformOrigin: 'top left', margin: '0 auto' }}>
            <iframe
              srcDoc={previewHTML}
              className="w-full h-full border-0"
              title="Invoice Preview"
              key={`preview-${Date.now()}`}
              onError={(e) => console.error('Preview iframe error:', e)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
