
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Download, FileText } from 'lucide-react';
import { useExportOperations } from '../builder/useExportOperations';

interface A4PreviewProps {
  htmlContent: string;
  placeholderValues: Record<string, string>;
}

export const A4Preview = ({ htmlContent, placeholderValues }: A4PreviewProps) => {
  // Replace all placeholders in the HTML content - moved before useExportOperations
  const processedHtml = React.useMemo(() => {
    let processed = htmlContent;
    
    // Replace all placeholders with actual values
    Object.entries(placeholderValues).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      processed = processed.replace(regex, value || '');
    });
    
    return processed;
  }, [htmlContent, placeholderValues]);

  const { handlePDFDownload, handleHTMLExport } = useExportOperations({
    documentName: placeholderValues.onderwerp || 'Document',
    htmlContent: processedHtml
  });

  // Create optimized A4 preview with better scaling and content fitting
  const getOptimizedPreviewHtml = (content: string) => {
    return content.replace(
      /<style[^>]*>([\s\S]*?)<\/style>/i,
      (match, styles) => {
        return `<style>
          ${styles}
          
          /* A4 Preview Optimizations */
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            transform-origin: top left;
            background: white;
          }
          
          body {
            transform: scale(0.85);
            width: 117.65%; /* 100% / 0.85 to compensate for scale */
            height: 117.65%;
            font-size: 14px;
          }
          
          /* Better content fitting */
          .header, .content, .document-info, .recipient, .footer {
            page-break-inside: avoid;
            margin-bottom: 15px;
          }
          
          /* Optimize text rendering */
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            line-height: 1.4;
          }
          
          /* Better spacing for A4 */
          p {
            margin: 8px 0;
          }
          
          h1, h2, h3 {
            margin: 12px 0 8px 0;
          }
          
          /* Optimize for preview */
          @media screen {
            body {
              box-shadow: none;
              border: none;
            }
          }
        </style>`;
      }
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 p-4 bg-white border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            A4 Preview
          </h3>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleHTMLExport}
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              HTML
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePDFDownload}
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex justify-center">
          <div 
            className="bg-white shadow-lg border border-gray-200"
            style={{
              width: '595px',    // A4 width at 72 DPI
              height: '842px',   // A4 height at 72 DPI
              aspectRatio: '210/297', // A4 ratio
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          >
            <iframe
              srcDoc={getOptimizedPreviewHtml(processedHtml)}
              className="w-full h-full border-0"
              title="A4 Document Preview"
              style={{
                background: 'white'
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="flex-shrink-0 px-4 py-2 bg-gray-100 border-t text-xs text-gray-600">
        <div className="flex justify-between items-center">
          <span>A4 Format (210×297mm)</span>
          <span>{Object.keys(placeholderValues).length} variabelen vervangen</span>
        </div>
      </div>
    </div>
  );
};
