
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { DocumentTemplateWithLabels } from '@/types/documentLabels';

interface InvoicePreviewHeaderProps {
  selectedTemplate: DocumentTemplateWithLabels | null;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onExport: () => void;
}

export const InvoicePreviewHeader = ({
  selectedTemplate,
  zoom,
  onZoomIn,
  onZoomOut,
  onExport
}: InvoicePreviewHeaderProps) => {
  return (
    <div className="flex-shrink-0 h-[60px] p-3 bg-white border-b border-l flex items-center justify-between">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
        <FileText className="h-4 w-4" />
        Live Voorbeeld
        {selectedTemplate && (
          <span className="text-xs text-gray-500">
            ({selectedTemplate.name})
          </span>
        )}
      </h3>
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onZoomOut}
          disabled={zoom <= 0.4}
          className="text-xs h-7"
        >
          <ZoomOut className="h-3 w-3" />
        </Button>
        <span className="text-xs font-medium min-w-[3rem] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onZoomIn}
          disabled={zoom >= 1.2}
          className="text-xs h-7"
        >
          <ZoomIn className="h-3 w-3" />
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onExport}
          className="text-xs h-7"
        >
          <Download className="h-3 w-3 mr-1" />
          Export
        </Button>
      </div>
    </div>
  );
};
