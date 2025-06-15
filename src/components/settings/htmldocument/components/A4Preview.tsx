
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
      
      <CardContent className="flex-1 p-4 flex items-center justify-center bg-gray-100 overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          <div 
            className="bg-white shadow-lg"
            style={{
              width: '210mm',
              height: '297mm',
              maxWidth: '100%',
              maxHeight: '100%',
              aspectRatio: '210 / 297',
              transform: 'scale(0.8)',
              transformOrigin: 'center',
              border: '1px solid #e5e7eb'
            }}
          >
            <iframe
              srcDoc={styledHtml}
              className="w-full h-full border-0"
              style={{
                width: '210mm',
                height: '297mm'
              }}
              title="A4 Document Preview"
            />
          </div>
        </div>
      </CardContent>
    </div>
  );
};
