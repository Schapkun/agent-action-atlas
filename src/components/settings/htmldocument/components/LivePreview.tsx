
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

  // Enhanced HTML wrapper with consistent A4 styling
  const getEnhancedPreviewDocument = (content: string) => {
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
    
    .preview-container {
      width: 100%;
      height: 100%;
      background: white;
      overflow: auto;
      padding: 20px;
    }
    
    .preview-content {
      width: 100%;
      min-height: calc(100% - 40px);
      font-size: 12px;
      line-height: 1.4;
      color: #333;
      max-width: 100%;
      overflow-wrap: break-word;
    }

    /* Enhanced table styling matching invoice preview */
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

    /* Typography matching invoice preview */
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

    /* Unified logo styling - consistent with invoice preview */
    .company-logo, .bedrijfslogo, img[src*="logo"], img[alt*="logo"], img[alt*="Logo"] {
      max-width: 200px;
      max-height: 100px;
      height: auto;
      object-fit: contain;
    }

    /* Additional logo variations */
    .logo, .Logo, .LOGO {
      max-width: 200px;
      max-height: 100px;
      height: auto;
      object-fit: contain;
    }

    /* Prevent content overflow - FIXED */
    .preview-content * {
      max-width: 100%;
      overflow-wrap: break-word;
    }

    /* Responsive scaling for live preview */
    @media (max-width: 768px) {
      .preview-container {
        padding: 10px;
      }
      
      .company-logo, .bedrijfslogo, img[src*="logo"], img[alt*="logo"], img[alt*="Logo"],
      .logo, .Logo, .LOGO {
        max-width: 150px;
        max-height: 75px;
      }
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
          <span className="text-xs text-gray-500">Universal System</span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="h-full">
          <iframe
            srcDoc={getEnhancedPreviewDocument(processedHtml)}
            className="w-full h-full border-0"
            title="Enhanced Live Preview"
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
