
import React from 'react';
import { DocumentTemplateWithLabels } from '@/types/documentLabels';
import { InvoiceFormData, LineItem } from '@/types/invoiceTypes';
import { useInvoicePreviewLogic } from '@/hooks/useInvoicePreviewLogic';
import { InvoicePreviewHeader } from './InvoicePreviewHeader';
import { InvoicePreviewContent } from './InvoicePreviewContent';
import { InvoicePreviewFooter } from './InvoicePreviewFooter';

interface InvoicePreviewProps {
  selectedTemplate: DocumentTemplateWithLabels | null;
  formData: InvoiceFormData;
  lineItems: LineItem[];
  invoiceNumber: string;
  className?: string;
}

export const InvoicePreview = ({ 
  selectedTemplate, 
  formData, 
  lineItems, 
  invoiceNumber,
  className = ""
}: InvoicePreviewProps) => {
  const [zoom, setZoom] = React.useState(0.8);
  
  const { previewHTML } = useInvoicePreviewLogic({
    selectedTemplate,
    formData,
    lineItems,
    invoiceNumber
  });

  const handleZoomIn = () => setZoom(Math.min(1.2, zoom + 0.1));
  const handleZoomOut = () => setZoom(Math.max(0.4, zoom - 0.1));

  const handleExport = () => {
    console.log('Export functionality to be implemented');
  };

  return (
    <div className={`h-full flex flex-col bg-gray-50 ${className}`}>
      <InvoicePreviewHeader
        selectedTemplate={selectedTemplate}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onExport={handleExport}
      />

      <InvoicePreviewContent
        previewHTML={previewHTML}
        zoom={zoom}
      />

      <InvoicePreviewFooter lineItems={lineItems} />
    </div>
  );
};
