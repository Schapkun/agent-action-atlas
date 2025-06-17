
export const getDocumentPreviewStyles = () => `
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
    max-width: 794px !important;
    margin: 0 auto !important;
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

  /* CONSISTENT LOGO STYLING - 180x90px for all previews */
  .preview-content .company-logo, .preview-content .bedrijfslogo, 
  .preview-content img[src*="logo"], .preview-content img[alt*="logo"], 
  .preview-content img[alt*="Logo"], .preview-content .logo, 
  .preview-content .Logo, .preview-content .LOGO,
  .company-logo, .bedrijfslogo, img[src*="logo"], img[alt*="logo"], 
  img[alt*="Logo"], .logo, .Logo, .LOGO {
    max-width: 180px !important;
    max-height: 90px !important;
    height: auto !important;
    object-fit: contain !important;
    display: block !important;
  }

  .preview-content *, .preview-content *:before, .preview-content *:after {
    max-width: 100% !important;
    overflow-wrap: break-word !important;
  }

  .preview-content div, .preview-content span, .preview-content li {
    font-size: 12px !important;
  }

  @media (max-width: 768px) {
    .preview-container {
      padding: 10px !important;
      max-width: 100% !important;
    }
    
    .company-logo, .bedrijfslogo, img[src*="logo"], img[alt*="logo"], img[alt*="Logo"],
    .logo, .Logo, .LOGO {
      max-width: 140px !important;
      max-height: 70px !important;
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
