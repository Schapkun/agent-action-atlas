
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Download, FileText } from 'lucide-react';
import { useExportOperations } from '../builder/useExportOperations';
import { useOrganization } from '@/contexts/OrganizationContext';
import { replaceAllPlaceholders } from '@/utils/universalPlaceholderReplacement';

interface A4PreviewProps {
  htmlContent: string;
  placeholderValues: Record<string, string>;
}

export const A4Preview = ({ htmlContent, placeholderValues }: A4PreviewProps) => {
  const { selectedOrganization } = useOrganization();
  
  // Process HTML content with universal placeholder replacement
  const processedHtml = React.useMemo(async () => {
    console.log('🎨 A4 PREVIEW: Processing HTML with universal system');
    
    try {
      const processed = await replaceAllPlaceholders(htmlContent, {
        organizationId: selectedOrganization?.id,
        placeholderValues
      });
      console.log('✅ A4 PREVIEW: HTML processed successfully');
      return processed;
    } catch (error) {
      console.error('❌ A4 PREVIEW: Error processing HTML:', error);
      return htmlContent;
    }
  }, [htmlContent, placeholderValues, selectedOrganization?.id]);

  // We need to handle the async nature of processedHtml
  const [finalHtml, setFinalHtml] = React.useState(htmlContent);

  React.useEffect(() => {
    const processContent = async () => {
      const result = await processedHtml;
      setFinalHtml(result);
    };
    processContent();
  }, [processedHtml]);

  const { handlePDFDownload, handleHTMLExport } = useExportOperations({
    documentName: placeholderValues.onderwerp || 'Document',
    htmlContent: finalHtml
  });

  // Create complete HTML document for A4 preview
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
      font-family: Arial, sans-serif;
      background: white;
    }
    
    .a4-container {
      width: 100%;
      height: 100%;
      background: white;
    }
    
    .a4-content {
      width: 100%;
      height: 100%;
      padding: 15mm;
      font-size: 12px;
      line-height: 1.4;
      color: #333;
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
      {/* Header - 60px hoog */}
      <div className="flex-shrink-0 h-[60px] p-3 bg-white border-b flex items-center justify-between">
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

      {/* 5px ruimte boven preview */}
      <div className="flex-shrink-0 h-[5px]" />

      {/* A4 Preview Area - vult de rest van de ruimte */}
      <div className="flex-1 min-h-0 flex justify-center items-center px-4">
        <div 
          className="bg-white shadow-lg border border-gray-300"
          style={{
            height: '100%',
            width: 'calc(100% * 0.707)', // A4 verhouding: breedte = 70.7% van hoogte
            maxWidth: '100%',
            aspectRatio: '210/297'
          }}
        >
          <iframe
            srcDoc={getA4PreviewDocument(finalHtml)}
            className="w-full h-full border-0"
            title="A4 Document Preview"
            style={{
              background: 'white',
              overflow: 'hidden'
            }}
          />
        </div>
      </div>

      {/* 5px ruimte onder preview */}
      <div className="flex-shrink-0 h-[5px]" />
      
      {/* Footer - 40px hoog */}
      <div className="flex-shrink-0 h-[40px] px-4 py-2 bg-gray-100 border-t text-xs text-gray-600 flex items-center justify-between">
        <span>A4 Formaat (210×297mm) - Universal Preview System</span>
        <span>{Object.keys(placeholderValues).length} variabelen vervangen</span>
      </div>
    </div>
  );
};
