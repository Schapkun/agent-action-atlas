
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { DocumentElement, DocumentSettings } from '../types/HTMLDocumentTypes';

interface HTMLPreviewProps {
  elements: DocumentElement[];
  settings: DocumentSettings;
  onClose: () => void;
}

export const HTMLPreview = ({ elements, settings, onClose }: HTMLPreviewProps) => {
  const [zoom, setZoom] = React.useState(0.8);

  const A4_WIDTH = 794;
  const A4_HEIGHT = 1123;

  const generateHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${settings.title}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
              background: #f5f5f5;
            }
            .document {
              width: ${A4_WIDTH}px;
              height: ${A4_HEIGHT}px;
              background: white;
              margin: 0 auto;
              position: relative;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .element {
              position: absolute;
            }
            @media print {
              body { margin: 0; padding: 0; background: white; }
              .document { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="document">
            ${elements.map(element => `
              <div class="element" style="
                left: ${element.position.x}px;
                top: ${element.position.y}px;
                width: ${element.size.width}px;
                height: ${element.size.height}px;
                font-size: ${element.styles.fontSize || '14px'};
                font-family: ${element.styles.fontFamily || 'Arial'};
                color: ${element.styles.color || '#000000'};
                background-color: ${element.styles.backgroundColor || 'transparent'};
                padding: ${element.styles.padding || '8px'};
                text-align: ${element.styles.textAlign || 'left'};
                font-weight: ${element.styles.fontWeight || 'normal'};
                border-radius: ${element.styles.borderRadius || '0px'};
              ">
                ${element.type === 'text' ? element.content :
                  element.type === 'image' || element.type === 'logo' ? 
                    (element.content.src ? `<img src="${element.content.src}" alt="${element.content.alt}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />` : `<div style="border: 2px dashed #ccc; height: 100%; display: flex; align-items: center; justify-content: center; color: #666;">${element.type === 'logo' ? 'Logo' : 'Afbeelding'}</div>`) :
                  element.type === 'table' ? `
                    <table style="width: 100%; height: 100%; border-collapse: collapse;">
                      <tbody>
                        ${Array.from({ length: 3 }, (_, row) => `
                          <tr>
                            ${Array.from({ length: 3 }, (_, col) => `
                              <td style="border: 1px solid #ccc; padding: 4px; font-size: 12px;">
                                Cel ${row + 1},${col + 1}
                              </td>
                            `).join('')}
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  ` :
                  element.type === 'shape' ? '' : 'Onbekend element'
                }
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;
  };

  const handleExportPDF = () => {
    const htmlContent = generateHTML();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${settings.title}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-3 px-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Live Preview</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(Math.max(0.3, zoom - 0.1))}
              disabled={zoom <= 0.3}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              disabled={zoom >= 2}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-1" />
              Export HTML
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-4 overflow-auto bg-gray-50">
        <div className="flex justify-center">
          <div
            className="bg-white shadow-lg"
            style={{
              width: A4_WIDTH * zoom,
              height: A4_HEIGHT * zoom,
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              position: 'relative'
            }}
          >
            {elements.map((element) => (
              <div
                key={element.id}
                style={{
                  position: 'absolute',
                  left: element.position.x * zoom,
                  top: element.position.y * zoom,
                  width: element.size.width * zoom,
                  height: element.size.height * zoom,
                  fontSize: `calc(${element.styles.fontSize || '14px'} * ${zoom})`,
                  fontFamily: element.styles.fontFamily || 'Arial',
                  color: element.styles.color || '#000000',
                  backgroundColor: element.styles.backgroundColor || 'transparent',
                  padding: `calc(${element.styles.padding || '8px'} * ${zoom})`,
                  textAlign: element.styles.textAlign as any || 'left',
                  fontWeight: element.styles.fontWeight || 'normal',
                  borderRadius: `calc(${element.styles.borderRadius || '0px'} * ${zoom})`
                }}
              >
                {element.type === 'text' && element.content}
                {(element.type === 'image' || element.type === 'logo') && (
                  element.content.src ? (
                    <img 
                      src={element.content.src} 
                      alt={element.content.alt}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <div 
                      style={{ 
                        border: '2px dashed #ccc', 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: '#666',
                        fontSize: `calc(12px * ${zoom})`
                      }}
                    >
                      {element.type === 'logo' ? 'Logo' : 'Afbeelding'}
                    </div>
                  )
                )}
                {element.type === 'table' && (
                  <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {Array.from({ length: 3 }, (_, row) => (
                        <tr key={row}>
                          {Array.from({ length: 3 }, (_, col) => (
                            <td 
                              key={col}
                              style={{ 
                                border: '1px solid #ccc', 
                                padding: `calc(4px * ${zoom})`,
                                fontSize: `calc(12px * ${zoom})`
                              }}
                            >
                              Cel {row + 1},{col + 1}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {element.type === 'shape' && (
                  <div style={{ width: '100%', height: '100%' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
