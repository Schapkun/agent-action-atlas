
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Eye, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const HTMLDocumentBuilder = () => {
  const [htmlCode, setHtmlCode] = useState(`<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nieuw Document</title>
    <style>
        @page {
            size: A4;
            margin: 2cm;
        }
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            line-height: 1.6;
            font-size: 12pt;
            overflow: hidden;
        }
        .document {
            width: 95%;
            height: 100%;
            padding: 2cm;
            box-sizing: border-box;
            background: white;
            margin: 0 auto;
            overflow: hidden;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .content {
            margin-bottom: 40px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 10pt;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 8px;
            border: 1px solid #ddd;
            text-align: left;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        @media screen {
            .document {
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                margin: 20px auto;
            }
        }
    </style>
</head>
<body>
    <div class="document">
        <div class="header">
            <h1>Document Titel</h1>
            <p>Subtitel of beschrijving</p>
        </div>
        
        <div class="content">
            <h2>Sectie 1</h2>
            <p>Begin hier met het schrijven van je document inhoud. Deze tekst wordt weergegeven in het A4 formaat zoals het zal worden afgedrukt.</p>
            
            <h2>Sectie 2</h2>
            <p>Voeg meer secties toe naar behoefte. Let op de marges en lettergrootte voor optimale leesbaarheid.</p>
            
            <table>
                <thead>
                    <tr>
                        <th>Kolom 1</th>
                        <th>Kolom 2</th>
                        <th>Kolom 3</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Data 1</td>
                        <td>Data 2</td>
                        <td>Data 3</td>
                    </tr>
                    <tr>
                        <td>Data 4</td>
                        <td>Data 5</td>
                        <td>Data 6</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="footer">
            <p>© 2024 - Gegenereerd op ${new Date().toLocaleDateString('nl-NL')}</p>
        </div>
    </div>
</body>
</html>`);
  
  const { toast } = useToast();

  const handleSaveTemplate = () => {
    console.log('Saving HTML template:', htmlCode);
    
    toast({
      title: "Template opgeslagen",
      description: "HTML document template is succesvol opgeslagen."
    });
  };

  const handleExportHTML = () => {
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.html';
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "HTML geëxporteerd",
      description: "HTML bestand is gedownload."
    });
  };

  const insertSnippet = (snippet: string) => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = htmlCode.substring(0, start) + snippet + htmlCode.substring(end);
      setHtmlCode(newValue);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + snippet.length, start + snippet.length);
      }, 0);
    }
  };

  const snippets = [
    {
      name: 'Heading',
      code: '\n        <h2>Nieuwe Titel</h2>\n'
    },
    {
      name: 'Paragraph',
      code: '\n        <p>Nieuwe paragraaf tekst.</p>\n'
    },
    {
      name: 'Table',
      code: '\n        <table>\n            <thead>\n                <tr>\n                    <th>Header 1</th>\n                    <th>Header 2</th>\n                </tr>\n            </thead>\n            <tbody>\n                <tr>\n                    <td>Data 1</td>\n                    <td>Data 2</td>\n                </tr>\n            </tbody>\n        </table>\n'
    },
    {
      name: 'Image',
      code: '\n        <img src="image-url.jpg" alt="Beschrijving" style="max-width: 100%; height: auto;" />\n'
    },
    {
      name: 'List',
      code: '\n        <ul>\n            <li>Item 1</li>\n            <li>Item 2</li>\n            <li>Item 3</li>\n        </ul>\n'
    },
    {
      name: 'Page Break',
      code: '\n        <div style="page-break-after: always;"></div>\n'
    }
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Simple Header without buttons */}
      <div className="flex items-center gap-2 mb-2 flex-shrink-0">
        <FileText className="h-4 w-4" />
        <h3 className="text-lg font-semibold">HTML Document Builder</h3>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-2 min-h-0 overflow-hidden">
        {/* Code Snippets */}
        <div className="col-span-2 overflow-hidden">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2 px-3 pt-3 flex-shrink-0">
              <CardTitle className="text-xs">HTML Snippets</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 px-3 pb-3 overflow-y-auto">
              <div className="space-y-1">
                {snippets.map((snippet) => (
                  <Button
                    key={snippet.name}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs h-7"
                    onClick={() => insertSnippet(snippet.code)}
                  >
                    {snippet.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* HTML Editor */}
        <div className="col-span-5 overflow-hidden">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2 px-3 pt-3 flex-shrink-0">
              <CardTitle className="text-xs flex items-center gap-2">
                <Code className="h-3 w-3" />
                HTML Code Editor
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-3 min-h-0 overflow-hidden">
              <Textarea
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                className="w-full h-full font-mono text-xs resize-none"
                placeholder="Schrijf je HTML code hier..."
              />
            </CardContent>
          </Card>
        </div>

        {/* A4 Preview - Optimized for maximum size */}
        <div className="col-span-5 overflow-hidden">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2 px-3 pt-3 flex-shrink-0">
              <CardTitle className="text-xs flex items-center gap-2">
                <Eye className="h-3 w-3" />
                A4 Document Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-3 overflow-hidden bg-gray-100 min-h-0">
              <div className="w-full h-full flex items-center justify-center">
                <div 
                  className="bg-white shadow-lg border border-gray-300"
                  style={{ 
                    width: '100%',
                    height: '100%',
                    maxWidth: 'calc(100vh * 0.707)', // A4 verhouding: 210/297 ≈ 0.707
                    maxHeight: '100%',
                    aspectRatio: '210 / 297'
                  }}
                >
                  <iframe
                    srcDoc={htmlCode}
                    className="w-full h-full border-0"
                    title="A4 Document Preview"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
