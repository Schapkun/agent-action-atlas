
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Download, FileText } from 'lucide-react';
import { useExportOperations } from '../builder/useExportOperations';
import { useOrganization } from '@/contexts/OrganizationContext';
import { replaceAllPlaceholders } from '@/utils/newUniversalPlaceholderReplacement';

interface A4PreviewProps {
  htmlContent: string;
  placeholderValues: Record<string, string>;
}

export const A4Preview = ({ htmlContent, placeholderValues }: A4PreviewProps) => {
  const { selectedOrganization } = useOrganization();
  const [finalHtml, setFinalHtml] = React.useState(htmlContent);

  React.useEffect(() => {
    const processContent = async () => {
      console.log('🎨 A4 PREVIEW: Processing with NEW SYSTEM');
      
      try {
        const processed = await replaceAllPlaceholders(htmlContent, {
          organizationId: selectedOrganization?.id,
          placeholderValues
        });
        console.log('✅ A4 PREVIEW: NEW SYSTEM completed');
        setFinalHtml(processed);
      } catch (error) {
        console.error('❌ A4 PREVIEW: NEW SYSTEM error:', error);
        setFinalHtml(htmlContent);
      }
    };
    
    processContent();
  }, [htmlContent, placeholderValues, selectedOrganization?.id]);

  const { handlePDFDownload, handleHTMLExport } = useExportOperations({
    documentName: placeholderValues.onderwerp || 'Document',
    htmlContent: finalHtml
  });

  const getA4PreviewDocument = (content: string) => {
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

    /* LOGO STYLING - ZEER BELANGRIJK */
    .a4-content .company-logo, .a4-content .bedrijfslogo, 
    .a4-content img[src*="logo"], .a4-content img[alt*="logo"], 
    .a4-content img[alt*="Logo"], .a4-content .logo, 
    .a4-content .Logo, .a4-content .LOGO,
    .company-logo, .bedrijfslogo, img[src*="logo"], img[alt*="logo"], 
    img[alt*="Logo"], .logo, .Logo, .LOGO {
      max-width: 160px !important;
      max-height: 80px !important;
      height: auto !important;
      object-fit: contain !important;
      display: block !important;
    }

    .a4-content *, .a4-content *:before, .a4-content *:after {
      max-width: 100% !important;
      overflow-wrap: break-word !important;
    }

    .a4-content div, .a4-content span, .a4-content li {
      font-size: 12px !important;
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

      <div className="flex-shrink-0 h-[5px]" />

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

      <div className="flex-shrink-0 h-[5px]" />
      
      <div className="flex-shrink-0 h-[40px] px-4 py-2 bg-gray-100 border-t text-xs text-gray-600 flex items-center justify-between">
        <span>A4 Formaat (210×297mm) • NEW System</span>
        <span>{Object.keys(placeholderValues).length} variabelen vervangen</span>
      </div>
    </div>
  );
};
