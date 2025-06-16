
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
      processed = processed.replace(regex, value || `[${key}]`);
    });
    
    return processed;
  }, [htmlContent, placeholderValues]);

  const { handlePDFDownload, handleHTMLExport } = useExportOperations({
    documentName: placeholderValues.onderwerp || 'Document',
    htmlContent: processedHtml
  });

  // Create complete HTML document with proper A4 styling
  const getCompleteHtmlDocument = (content: string) => {
    // If content is already a complete HTML document, enhance its styles
    if (content.includes('<!DOCTYPE html>')) {
      return content.replace(
        /<style[^>]*>([\s\S]*?)<\/style>/i,
        (match, styles) => {
          return `<style>
            ${styles}
            
            /* A4 Preview Optimizations */
            @page {
              size: A4;
              margin: 0;
            }
            
            html {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              overflow-x: hidden;
            }
            
            body {
              margin: 0;
              padding: 20mm;
              width: calc(210mm - 40mm);
              min-height: calc(297mm - 40mm);
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: #333;
              background: white;
              box-sizing: border-box;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            
            .header {
              margin-bottom: 30px;
            }
            
            .logo {
              max-width: 150px;
              height: auto;
              margin-bottom: 10px;
            }
            
            .document-info, .recipient, .content {
              margin-bottom: 20px;
            }
            
            .footer {
              margin-top: 40px;
              font-size: 10px;
              color: #666;
            }
            
            p {
              margin: 8px 0;
            }
            
            h1 {
              font-size: 18px;
              margin: 0 0 10px 0;
              font-weight: bold;
            }
            
            h2, h3 {
              font-size: 14px;
              margin: 15px 0 8px 0;
              font-weight: bold;
            }
            
            strong {
              font-weight: bold;
            }
            
            /* Ensure content fits on page */
            * {
              page-break-inside: avoid;
            }
          </style>`;
        }
      );
    }
    
    // If content is just HTML fragments, wrap it in a complete document
    return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document Preview</title>
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    
    html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow-x: hidden;
    }
    
    body {
      margin: 0;
      padding: 20mm;
      width: calc(210mm - 40mm);
      min-height: calc(297mm - 40mm);
      font-family: Arial, sans-serif;
      font-size: 12px;
      line-height: 1.4;
      color: #333;
      background: white;
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .header {
      margin-bottom: 30px;
    }
    
    .logo {
      max-width: 150px;
      height: auto;
      margin-bottom: 10px;
    }
    
    .document-info, .recipient, .content {
      margin-bottom: 20px;
    }
    
    .footer {
      margin-top: 40px;
      font-size: 10px;
      color: #666;
    }
    
    p {
      margin: 8px 0;
    }
    
    h1 {
      font-size: 18px;
      margin: 0 0 10px 0;
      font-weight: bold;
    }
    
    h2, h3 {
      font-size: 14px;
      margin: 15px 0 8px 0;
      font-weight: bold;
    }
    
    strong {
      font-weight: bold;
    }
    
    /* Ensure content fits on page */
    * {
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
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
              maxHeight: 'none'
            }}
          >
            <iframe
              srcDoc={getCompleteHtmlDocument(processedHtml)}
              className="w-full h-full border-0"
              title="A4 Document Preview"
              style={{
                background: 'white',
                transform: 'scale(1)',
                transformOrigin: 'top left'
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
