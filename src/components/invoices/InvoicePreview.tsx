
import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, ZoomIn, ZoomOut } from 'lucide-react';
import { DocumentTemplateWithLabels } from '@/types/documentLabels';
import { InvoiceFormData, LineItem } from '@/types/invoiceTypes';
import { generatePreviewHTML } from '@/utils/invoiceTemplateUtils';
import { useOrganization } from '@/contexts/OrganizationContext';

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
  const { currentOrganization } = useOrganization();

  const previewHTML = useMemo(async () => {
    if (!selectedTemplate) {
      return '<div style="padding: 40px; text-align: center; color: #6b7280;">Geen template geselecteerd</div>';
    }

    try {
      return await generatePreviewHTML(
        [selectedTemplate],
        selectedTemplate.id,
        formData,
        lineItems,
        invoiceNumber,
        currentOrganization?.id
      );
    } catch (error) {
      console.error('Error generating preview:', error);
      return '<div style="padding: 40px; text-align: center; color: #dc2626;">Fout bij laden van voorbeeld</div>';
    }
  }, [selectedTemplate, formData, lineItems, invoiceNumber, currentOrganization?.id]);

  const getA4PreviewDocument = (content: string) => {
    return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Factuur Voorbeeld</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html, body {
      width: 100%;
      height: 100%;
      font-family: Arial, sans-serif;
      background: white;
      overflow: hidden;
    }
    
    .a4-container {
      width: 100%;
      height: 100%;
      background: white;
      overflow: auto;
    }
    
    .a4-content {
      width: 100%;
      min-height: 100%;
      padding: 20mm;
      font-size: 12px;
      line-height: 1.4;
      color: #333;
    }

    /* Enhanced table styling */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 14px;
    }
    
    th {
      background: #f8f9fa;
      font-weight: 600;
      padding: 12px 8px;
      text-align: left;
      border-bottom: 2px solid #e9ecef;
    }
    
    td {
      padding: 10px 8px;
      text-align: left;
      border-bottom: 1px solid #e9ecef;
    }

    /* Typography */
    h1, h2, h3 {
      color: #212529;
      font-weight: 600;
      margin: 20px 0 12px 0;
    }
    
    h1 { font-size: 24px; }
    h2 { font-size: 20px; }
    h3 { font-size: 16px; }
    
    p {
      font-size: 14px;
      margin: 8px 0;
      color: #495057;
    }
  </style>
</head>
<body>
  <div class="a4-container">
    <div class="a4-content">
      ${content}
    </div>
  </div>
</body>
</html>`;
  };

  const handleZoomIn = () => setZoom(Math.min(1.2, zoom + 0.1));
  const handleZoomOut = () => setZoom(Math.max(0.4, zoom - 0.1));

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export functionality to be implemented');
  };

  return (
    <div className={`h-full flex flex-col bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="flex-shrink-0 h-[60px] p-3 bg-white border-b border-l flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4" />
          Live Voorbeeld
          {selectedTemplate && (
            <span className="text-xs text-gray-500">({selectedTemplate.name})</span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleZoomOut}
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
            onClick={handleZoomIn}
            disabled={zoom >= 1.2}
            className="text-xs h-7"
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExport}
            className="text-xs h-7"
          >
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 min-h-0 flex justify-center items-start p-4 overflow-auto">
        <div 
          className="bg-white shadow-lg border border-gray-300 transition-transform duration-200"
          style={{
            width: `${794 * zoom}px`, // A4 width at 96 DPI
            minHeight: `${1123 * zoom}px`, // A4 height at 96 DPI
            transform: `scale(${zoom})`,
            transformOrigin: 'top center'
          }}
        >
          <React.Suspense 
            fallback={
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                Laden...
              </div>
            }
          >
            <iframe
              srcDoc={getA4PreviewDocument(previewHTML)}
              className="w-full h-full border-0"
              title="Factuur Voorbeeld"
              style={{
                width: '794px',
                height: '1123px'
              }}
            />
          </React.Suspense>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 h-[40px] px-4 py-2 bg-gray-100 border-t border-l text-xs text-gray-600 flex items-center justify-between">
        <span>A4 Formaat • Real-time preview</span>
        <span>{lineItems.length} regel{lineItems.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
};
