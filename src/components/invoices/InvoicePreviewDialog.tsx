
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
          <div className="bg-white mx-auto shadow-lg overflow-auto" style={{ width: '210mm', height: '297mm', transform: 'scale(0.7)', transformOrigin: 'top center' }}>
            <div 
              dangerouslySetInnerHTML={{ __html: previewHTML }}
              className="w-full h-full"
              style={{ 
                width: '210mm', 
                height: '297mm',
                fontFamily: 'Arial, sans-serif',
                padding: '20mm',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
