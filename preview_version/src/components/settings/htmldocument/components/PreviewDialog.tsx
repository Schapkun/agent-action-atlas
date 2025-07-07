
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, X } from 'lucide-react';

interface PreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string;
  documentName: string;
}

export const PreviewDialog = ({ isOpen, onClose, htmlContent, documentName }: PreviewDialogProps) => {
  // Create scaled HTML content for full preview
  const getFullPreviewContent = (content: string) => {
    // Add responsive CSS to the existing content
    const scaledContent = content.replace(
      /<style[^>]*>([\s\S]*?)<\/style>/i,
      (match, styles) => {
        return `<style>
          ${styles}
          
          /* Full preview CSS */
          html, body {
            margin: 0;
            padding: 20px;
            background: white;
            font-family: Arial, sans-serif;
            line-height: 1.4;
          }
          
          @media print {
            body { padding: 0; }
          }
        </style>`;
      }
    );

    return scaledContent;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview: {documentName || 'Document'}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <div className="w-full h-[80vh] border rounded-lg">
            <iframe
              srcDoc={getFullPreviewContent(htmlContent)}
              className="w-full h-full border-0 rounded-lg"
              title="Document Full Preview"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
