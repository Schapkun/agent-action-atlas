
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { replaceAllPlaceholders } from '@/utils/universalPlaceholderReplacement';

interface LivePreviewProps {
  htmlContent: string;
  layoutId: string;
}

export const LivePreview = ({ htmlContent, layoutId }: LivePreviewProps) => {
  const { selectedOrganization } = useOrganization();
  const [processedHtml, setProcessedHtml] = React.useState(htmlContent);

  React.useEffect(() => {
    const processContent = async () => {
      console.log('🎨 LIVE PREVIEW: Processing HTML with universal system');
      
      try {
        const processed = await replaceAllPlaceholders(htmlContent, {
          organizationId: selectedOrganization?.id
        });
        console.log('✅ LIVE PREVIEW: HTML processed successfully');
        setProcessedHtml(processed);
      } catch (error) {
        console.error('❌ LIVE PREVIEW: Error processing HTML:', error);
        setProcessedHtml(htmlContent);
      }
    };

    processContent();
  }, [htmlContent, selectedOrganization?.id]);

  // UNIFIED HTML wrapper - IDENTICAL to InvoicePreview for consistency
  const getUnifiedPreviewDocument = (content: string) => {
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
  <title>Live Preview</title>
  <style>
    /* UNIFIED: High specificity reset - IDENTICAL to InvoicePreview */
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
    
    .preview-container {
      width: 100% !important;
      height: 100% !important;
      background: white !important;
      overflow: auto !important;
      padding: 20px !important;
    }
    
    .preview-content {
      width: 100% !important;
      min-height: calc(100% - 40px) !important;
      font-size: 12px !important;
      line-height: 1.4 !important;
      color: #333 !important;
      max-width: 100% !important;
      overflow-wrap: break-word !important;
    }

    /* UNIFIED: Table styling - IDENTICAL to InvoicePreview */
    .preview-content table, table {
      width: 100% !important;
      border-collapse: collapse !important;
      margin: 16px 0 !important;
      font-size: 12px !important;
    }
    
    .preview-content th, th {
      background: #f8f9fa !important;
      font-weight: 600 !important;
      padding: 8px 6px !important;
      text-align: left !important;
      border-bottom: 2px solid #e9ecef !important;
      font-size: 12px !important;
    }
    
    .preview-content td, td {
      padding: 6px 6px !important;
      text-align: left !important;
      border-bottom: 1px solid #e9ecef !important;
      font-size: 12px !important;
    }

    /* UNIFIED: Typography - IDENTICAL to InvoicePreview */
    .preview-content h1, .preview-content h2, .preview-content h3, h1, h2, h3 {
      color: #212529 !important;
      font-weight: 600 !important;
      margin: 16px 0 8px 0 !important;
    }
    
    .preview-content h1, h1 { font-size: 18px !important; }
    .preview-content h2, h2 { font-size: 16px !important; }
    .preview-content h3, h3 { font-size: 14px !important; }
    
    .preview-content p, p {
      font-size: 12px !important;
      margin: 6px 0 !important;
      color: #495057 !important;
    }

    /* CRITICAL: Logo styling with MAXIMUM specificity to override template CSS */
    .preview-content .company-logo, .preview-content .bedrijfslogo, 
    .preview-content img[src*="logo"], .preview-content img[alt*="logo"], 
    .preview-content img[alt*="Logo"], .preview-content .logo, 
    .preview-content .Logo, .preview-content .LOGO,
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
    .preview-content div, .preview-content span, .preview-content li {
      font-size: 12px !important;
    }

    /* UNIFIED: Prevent content overflow */
    .preview-content *, .preview-content *:before, .preview-content *:after {
      max-width: 100% !important;
      overflow-wrap: break-word !important;
    }
  </style>
</head>
<body>
  <div class="preview-container">
    <div class="preview-content">
      ${bodyContent}
    </div>
  </div>
</body>
</html>`;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <CardHeader className="py-3 px-4 border-b">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span className="text-sm font-medium">Live Preview</span>
          <span className="text-xs text-gray-500">Unified System</span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="h-full">
          <iframe
            srcDoc={getUnifiedPreviewDocument(processedHtml)}
            className="w-full h-full border-0"
            title="Unified Live Preview"
            style={{
              background: 'white',
              minHeight: '400px'
            }}
          />
        </div>
      </CardContent>
    </div>
  );
};
