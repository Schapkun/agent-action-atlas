
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Eye } from 'lucide-react';

interface A4PreviewProps {
  htmlContent: string;
  placeholderValues: Record<string, string>;
}

export const A4Preview = ({ htmlContent, placeholderValues }: A4PreviewProps) => {
  // Replace placeholders in HTML content
  const replacePlaceholders = (content: string) => {
    let replaced = content;
    Object.entries(placeholderValues).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      replaced = replaced.replace(regex, value || `<span style="color:#9ca3af;">[${key}]</span>`);
    });
    return replaced;
  };

  const processedHtml = replacePlaceholders(htmlContent);

  // Create styled HTML with A4 constraints
  const styledHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
          }
          
          .page {
            width: 210mm;
            min-height: 297mm;
            background: white;
            margin: 0 auto 20mm auto;
            padding: 20mm;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            page-break-after: always;
            overflow: hidden;
          }
          
          .page:last-child {
            margin-bottom: 0;
          }
          
          h1 { font-size: 18px; margin-bottom: 12px; }
          h2 { font-size: 16px; margin-bottom: 10px; }
          h3 { font-size: 14px; margin-bottom: 8px; }
          p { margin-bottom: 8px; }
          ul, ol { margin-bottom: 8px; padding-left: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
          th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          
          @media print {
            body { background: white; padding: 0; }
            .page { 
              margin: 0; 
              box-shadow: none; 
              page-break-after: always;
            }
          }
        </style>
      </head>
      <body>
        <div class="page">
          ${processedHtml}
        </div>
      </body>
    </html>
  `;

  return (
    <div className="h-full flex flex-col bg-white">
      <CardHeader className="py-3 px-4 border-b">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span className="text-sm font-medium">A4 Preview</span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-4 overflow-auto bg-gray-100">
        <div className="flex justify-center">
          <iframe
            srcDoc={styledHtml}
            className="w-full border-0 rounded-lg shadow-sm"
            style={{
              height: '800px',
              maxWidth: '600px',
              background: 'white'
            }}
            title="A4 Document Preview"
          />
        </div>
      </CardContent>
    </div>
  );
};
