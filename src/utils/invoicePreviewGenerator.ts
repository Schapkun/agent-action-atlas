
export const generateInvoicePreviewDocument = (content: string, title: string = 'Factuur Preview') => {
  // Extract body content if it exists, otherwise use the content as-is
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
    body {
      margin: 0;
      padding: 20px;
      font-family: Arial, sans-serif;
      background: white;
      max-width: 794px;
      margin: 0 auto;
      overflow-x: hidden;
    }
    
    /* WORKING LOGO STYLING - Simple and effective */
    .company-logo, .bedrijfslogo, 
    img[src*="logo"], img[alt*="logo"], 
    img[alt*="Logo"], .logo, 
    .Logo, .LOGO {
      max-width: 200px !important;
      max-height: 100px !important;
      height: auto !important;
      width: auto !important;
      object-fit: contain !important;
      display: block !important;
    }

    /* Ensure all images don't break layout */
    img {
      max-width: 100%;
      height: auto;
    }

    /* Mobile responsive logo */
    @media (max-width: 768px) {
      .company-logo, .bedrijfslogo, img[src*="logo"], img[alt*="logo"], img[alt*="Logo"],
      .logo, .Logo, .LOGO {
        max-width: 160px !important;
        max-height: 80px !important;
      }
    }
  </style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;
};
