
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
      
      // Special handling for logo - create img tag if it's a data URL
      if (key === 'logo' && value && value.startsWith('data:')) {
        replaced = replaced.replace(regex, `<img src="${value}" alt="Logo" style="max-width: 150px; height: auto;" />`);
      } else if (value) {
        replaced = replaced.replace(regex, value);
      } else {
        replaced = replaced.replace(regex, `<span style="color:#9ca3af;">[${key}]</span>`);
      }
    });
    return replaced;
  };

  const processedHtml = replacePlaceholders(htmlContent);

  // Create styled HTML with strict A4 constraints
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
          
          @page {
            size: A4;
            margin: 0;
          }
          
          body {
            font-family: 'Inter', Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            background: white;
            width: 210mm;
            height: 297mm;
            padding: 20mm;
            margin: 0;
            overflow: hidden;
            position: relative;
          }
          
          h1 { font-size: 18px; margin-bottom: 12px; }
          h2 { font-size: 16px; margin-bottom: 10px; }
          h3 { font-size: 14px; margin-bottom: 8px; }
          p { margin-bottom: 8px; }
          ul, ol { margin-bottom: 8px; padding-left: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
          th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          
          .header {
            text-align: right;
            margin-bottom: 40px;
          }
          .logo {
            max-width: 150px;
            height: auto;
          }
          .document-info {
            margin-bottom: 30px;
          }
          .content {
            margin-bottom: 30px;
          }
          .footer {
            margin-top: 50px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        ${processedHtml}
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
      
      <CardContent className="flex-1 p-4 flex items-center justify-center bg-gray-50">
        <div className="w-full h-full flex items-center justify-center" style={{ padding: '5px' }}>
          <div 
            className="bg-white shadow-xl border border-gray-200 overflow-hidden"
            style={{
              width: 'min(calc(100% - 10px), calc((100% - 58px) * 0.7071))',
              height: 'calc(min(calc(100% - 10px), calc((100% - 58px) * 0.7071)) / 0.7071)',
              aspectRatio: '210 / 297'
            }}
          >
            <iframe
              srcDoc={styledHtml}
              className="w-full h-full border-0"
              title="A4 Document Preview"
              style={{
                width: '100%',
                height: '100%'
              }}
            />
          </div>
        </div>
      </CardContent>
    </div>
  );
};
