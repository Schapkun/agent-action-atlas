
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
          <div className="bg-white mx-auto shadow-lg overflow-auto h-full">
            <iframe
              srcDoc={previewHTML}
              className="w-full h-full border-0"
              style={{ 
                width: '100%', 
                height: '100%',
                minHeight: '600px'
              }}
              title="Invoice Preview"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
