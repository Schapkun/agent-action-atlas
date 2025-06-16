
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Download, FileText } from 'lucide-react';
import { useExportOperations } from '../builder/useExportOperations';

interface A4PreviewProps {
  htmlContent: string;
  placeholderValues: Record<string, string>;
}

export const A4Preview = ({ htmlContent, placeholderValues }: A4PreviewProps) => {
  // Replace all placeholders in the HTML content
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

  // Create complete HTML document optimized for A4 preview with exact margins
  const getA4PreviewDocument = (content: string) => {
    // Extract body content if it's a complete HTML document
    let bodyContent = content;
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      bodyContent = bodyMatch[1];
    } else if (content.includes('<!DOCTYPE html>')) {
      const afterBodyMatch = content.match(/<body[^>]*>([\s\S]*)/i);
      if (afterBodyMatch) {
        bodyContent = afterBodyMatch[1].replace(/<\/body>[\s\S]*$/i, '');
      }
    }

    return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A4 Document Preview</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      font-family: Arial, sans-serif;
      background: white;
    }
    
    .a4-container {
      width: 100%;
      height: 100%;
      padding: 5px;
      background: white;
      overflow: hidden;
      position: relative;
    }
    
    .a4-content {
      width: 100%;
      height: 100%;
      padding: 15mm;
      overflow: hidden;
      font-size: 11px;
      line-height: 1.4;
      color: #333;
      position: relative;
    }
    
    .header {
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid #eee;
    }
    
    .logo {
      max-width: 120px;
      max-height: 60px;
      height: auto;
      margin-bottom: 6px;
    }
    
    .document-info {
      margin: 12px 0;
      font-size: 10px;
    }
    
    .recipient {
      margin: 12px 0;
      font-size: 10px;
    }
    
    .content {
      margin: 15px 0;
      flex: 1;
      font-size: 11px;
      line-height: 1.5;
    }
    
    .footer {
      margin-top: 15px;
      padding-top: 8px;
      border-top: 1px solid #eee;
      font-size: 9px;
      color: #666;
    }
    
    h1 {
      font-size: 16px;
      margin: 0 0 8px 0;
      font-weight: bold;
    }
    
    h2, h3 {
      font-size: 12px;
      margin: 8px 0 4px 0;
      font-weight: bold;
    }
    
    p {
      margin: 4px 0;
      line-height: 1.4;
    }
    
    strong {
      font-weight: bold;
    }
    
    .bedrijf-info {
      text-align: right;
      font-size: 9px;
      line-height: 1.3;
    }
    
    .document-details {
      font-size: 10px;
      line-height: 1.4;
    }
    
    .main-content {
      font-size: 11px;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="a4-container">
    <div class="a4-content">
      ${bodyContent}
    </div>
  </div>
</body>
</html>`;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 p-3 bg-white border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4" />
            A4 Preview
          </h3>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleHTMLExport}
              className="text-xs h-7"
            >
              <Download className="h-3 w-3 mr-1" />
              HTML
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePDFDownload}
              className="text-xs h-7"
            >
              <Download className="h-3 w-3 mr-1" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      {/* A4 Preview Area - Increased size with proper ratio */}
      <div className="flex-1 p-6 overflow-hidden flex justify-center items-center">
        <div 
          className="bg-white shadow-lg border border-gray-300 overflow-hidden"
          style={{
            width: '700px',           // Increased from 595px
            height: '990px',          // A4 ratio maintained (700 * 297/210 = 990)
            aspectRatio: '210/297',   // A4 ratio
            maxWidth: 'calc(100vw - 48px)',
            maxHeight: 'calc(100vh - 180px)',
          }}
        >
          <iframe
            srcDoc={getA4PreviewDocument(processedHtml)}
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
      
      {/* Status Bar */}
      <div className="flex-shrink-0 px-4 py-2 bg-gray-100 border-t text-xs text-gray-600">
        <div className="flex justify-between items-center">
          <span>A4 Formaat (210×297mm) - 5px marges van header en footer</span>
          <span>{Object.keys(placeholderValues).length} variabelen vervangen</span>
        </div>
      </div>
    </div>
  );
};
