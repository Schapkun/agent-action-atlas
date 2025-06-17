
export const getDocumentPreviewStyles = () => `
  html, body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
    background: white;
    overflow: auto;
  }
  
  .preview-container {
    width: 100%;
    min-height: 100vh;
    background: white;
    padding: 20px;
    max-width: 794px;
    margin: 0 auto;
    box-sizing: border-box;
  }
  
  .preview-content {
    width: 100%;
    min-height: calc(100% - 40px);
    font-size: 12px;
    line-height: 1.4;
    color: #333;
    overflow-wrap: break-word;
  }

  /* LESS AGGRESSIVE: Only apply table styling if no existing styles */
  .preview-content table:not([style*="border"]):not([class*="table"]) {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 12px;
  }
  
  .preview-content th:not([style*="background"]):not([style*="padding"]):not([class]) {
    background: #f8f9fa;
    font-weight: 600;
    padding: 8px 6px;
    text-align: left;
    border-bottom: 2px solid #e9ecef;
    font-size: 12px;
  }
  
  .preview-content td:not([style*="padding"]):not([class]) {
    padding: 6px 6px;
    text-align: left;
    border-bottom: 1px solid #e9ecef;
    font-size: 12px;
  }

  /* LESS AGGRESSIVE: Only apply heading styles if no existing styles or classes */
  .preview-content h1:not([style]):not([class]), 
  .preview-content h2:not([style]):not([class]), 
  .preview-content h3:not([style]):not([class]) {
    color: #212529;
    font-weight: 600;
    margin: 16px 0 8px 0;
  }
  
  .preview-content h1:not([style]):not([class]) { font-size: 18px; }
  .preview-content h2:not([style]):not([class]) { font-size: 16px; }
  .preview-content h3:not([style]):not([class]) { font-size: 14px; }
  
  .preview-content p:not([style]):not([class]) {
    font-size: 12px;
    margin: 6px 0;
    color: #495057;
  }

  /* WORKING LOGO STYLING - consistent across all previews */
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
    display: block !important;
  }

  /* Ensure images don't break layout */
  .preview-content img {
    max-width: 100%;
    height: auto;
  }

  @media (max-width: 768px) {
    .preview-container {
      padding: 10px;
      max-width: 100%;
    }
    
    .company-logo, .bedrijfslogo, img[src*="logo"], img[alt*="logo"], img[alt*="Logo"],
    .logo, .Logo, .LOGO {
      max-width: 160px !important;
      max-height: 80px !important;
    }
  }
`;

export const generatePreviewDocument = (content: string, title: string = 'Document Preview') => {
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
  <title>${title}</title>
  <style>
    ${getDocumentPreviewStyles()}
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
