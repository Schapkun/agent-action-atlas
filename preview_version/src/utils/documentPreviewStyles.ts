
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

  /* Enhanced table styling for invoices */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 12px;
  }
  
  th {
    background: #f8f9fa;
    font-weight: 600;
    padding: 8px 6px;
    text-align: left;
    border-bottom: 2px solid #e9ecef;
    font-size: 12px;
  }
  
  td {
    padding: 6px 6px;
    text-align: left;
    border-bottom: 1px solid #e9ecef;
    font-size: 12px;
  }

  /* Enhanced heading styles */
  h1, h2, h3 {
    color: #212529;
    font-weight: 600;
    margin: 16px 0 8px 0;
  }
  
  h1 { font-size: 18px; }
  h2 { font-size: 16px; }
  h3 { font-size: 14px; }
  
  p {
    font-size: 12px;
    margin: 6px 0;
    color: #495057;
  }

  /* ENHANCED LOGO STYLING - more comprehensive coverage */
  img[src*="logo"], 
  img[alt*="logo"], 
  img[alt*="Logo"], 
  img[class*="logo"],
  img[class*="Logo"],
  .company-logo, 
  .bedrijfslogo, 
  .logo, 
  .Logo, 
  .LOGO {
    max-width: 200px !important;
    max-height: 100px !important;
    height: auto !important;
    width: auto !important;
    object-fit: contain !important;
    display: block !important;
    margin: 8px 0 !important;
  }

  /* Fallback for all images to prevent layout breaks */
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  /* Specific styles for invoice layout */
  .invoice-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e9ecef;
  }

  .invoice-details {
    margin: 20px 0;
  }

  .invoice-table {
    width: 100%;
    margin: 20px 0;
  }

  .invoice-total {
    text-align: right;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 2px solid #212529;
  }

  @media (max-width: 768px) {
    .preview-container {
      padding: 10px;
      max-width: 100%;
    }
    
    img[src*="logo"], img[alt*="logo"], img[alt*="Logo"],
    .company-logo, .bedrijfslogo, .logo, .Logo, .LOGO {
      max-width: 160px !important;
      max-height: 80px !important;
    }
  }
`;

export const generatePreviewDocument = (content: string, title: string = 'Document Preview') => {
  // Extract body content if it exists, otherwise use the full content
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

  // Apply enhanced styling to the content
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
