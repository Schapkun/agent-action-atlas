
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

  // UNIFIED: Create complete HTML document with IDENTICAL styling to LivePreview and InvoicePreview
  const getUnifiedA4Document = (content: string) => {
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
    /* UNIFIED: High specificity reset - IDENTICAL to LivePreview and InvoicePreview */
    * {
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
    }
    
    html, body {
      width: 100% !important;
      height: 100% !important;
      font-family: Arial, sans-serif !important;
      background: white !important;
      overflow: hidden !important;
    }
    
    .a4-container {
      width: 100% !important;
      height: 100% !important;
      background: white !important;
      overflow: auto !important;
      padding: 20px !important;
      max-width: 794px !important;
      margin: 0 auto !important;
    }
    
    .a4-content {
      width: 100% !important;
      min-height: calc(100% - 40px) !important;
      font-size: 12px !important;
      line-height: 1.4 !important;
      color: #333 !important;
      max-width: 100% !important;
      overflow-wrap: break-word !important;
    }

    /* UNIFIED: Table styling - IDENTICAL to other previews */
    .a4-content table, table {
      width: 100% !important;
      border-collapse: collapse !important;
      margin: 16px 0 !important;
      font-size: 12px !important;
    }
    
    .a4-content th, th {
      background: #f8f9fa !important;
      font-weight: 600 !important;
      padding: 8px 6px !important;
      text-align: left !important;
      border-bottom: 2px solid #e9ecef !important;
      font-size: 12px !important;
    }
    
    .a4-content td, td {
      padding: 6px 6px !important;
      text-align: left !important;
      border-bottom: 1px solid #e9ecef !important;
      font-size: 12px !important;
    }

    /* UNIFIED: Typography - IDENTICAL to other previews */
    .a4-content h1, .a4-content h2, .a4-content h3, h1, h2, h3 {
      color: #212529 !important;
      font-weight: 600 !important;
      margin: 16px 0 8px 0 !important;
    }
    
    .a4-content h1, h1 { font-size: 18px !important; }
    .a4-content h2, h2 { font-size: 16px !important; }
    .a4-content h3, h3 { font-size: 14px !important; }
    
    .a4-content p, p {
      font-size: 12px !important;
      margin: 6px 0 !important;
      color: #495057 !important;
    }

    /* CRITICAL: Logo styling with MAXIMUM specificity to override template CSS */
    .a4-content .company-logo, .a4-content .bedrijfslogo, 
    .a4-content img[src*="logo"], .a4-content img[alt*="logo"], 
    .a4-content img[alt*="Logo"], .a4-content .logo, 
    .a4-content .Logo, .a4-content .LOGO,
    .company-logo, .bedrijfslogo, img[src*="logo"], img[alt*="logo"], 
    img[alt*="Logo"], .logo, .Logo, .LOGO {
      max-width: 200px !important;
      max-height: 100px !important;
      height: auto !important;
      object-fit: contain !important;
      width: auto !important;
      min-width: unset !important;
      min-height: unset !important;
    }

    /* UNIFIED: Override template font sizes */
    .a4-content div, .a4-content span, .a4-content li {
      font-size: 12px !important;
    }

    /* UNIFIED: Prevent content overflow */
    .a4-content *, .a4-content *:before, .a4-content *:after {
      max-width: 100% !important;
      overflow-wrap: break-word !important;
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

      {/* A4 Preview Area with proper overflow handling */}
      <div className="flex-1 min-h-0 flex justify-center items-center px-4 overflow-hidden">
        <div 
          className="bg-white shadow-lg border border-gray-300 overflow-hidden"
          style={{
            height: '100%',
            width: '100%',
            maxWidth: '794px',
            aspectRatio: '210/297'
          }}
        >
          <iframe
            srcDoc={getUnifiedA4Document(finalHtml)}
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
        <span>A4 Formaat (210×297mm) • Unified Preview System</span>
        <span>{Object.keys(placeholderValues).length} variabelen vervangen</span>
      </div>
    </div>
  );
};
