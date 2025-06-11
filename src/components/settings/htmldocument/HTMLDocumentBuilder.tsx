
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Download, Save, Eye, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const HTMLDocumentBuilder = () => {
  const [htmlCode, setHtmlCode] = useState(`<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nieuw Document</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .content {
            max-width: 800px;
            margin: 0 auto;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Document Titel</h1>
        <p>Subtitel of beschrijving</p>
    </div>
    
    <div class="content">
        <h2>Sectie 1</h2>
        <p>Begin hier met het schrijven van je document inhoud.</p>
        
        <h2>Sectie 2</h2>
        <p>Voeg meer secties toe naar behoefte.</p>
        
        <table border="1" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
                <tr>
                    <th style="padding: 8px; background-color: #f5f5f5;">Kolom 1</th>
                    <th style="padding: 8px; background-color: #f5f5f5;">Kolom 2</th>
                    <th style="padding: 8px; background-color: #f5f5f5;">Kolom 3</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding: 8px;">Data 1</td>
                    <td style="padding: 8px;">Data 2</td>
                    <td style="padding: 8px;">Data 3</td>
                </tr>
            </tbody>
        </table>
    </div>
    
    <div class="footer">
        <p>© 2024 - Gegenereerd op ${new Date().toLocaleDateString('nl-NL')}</p>
    </div>
</body>
</html>`);
  
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const handleSaveTemplate = () => {
    // TODO: Implement save to database
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
      
      // Focus and set cursor position after snippet
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + snippet.length, start + snippet.length);
      }, 0);
    }
  };

  const snippets = [
    {
      name: 'Heading',
      code: '\n<h2>Nieuwe Titel</h2>\n'
    },
    {
      name: 'Paragraph',
      code: '\n<p>Nieuwe paragraaf tekst.</p>\n'
    },
    {
      name: 'Table',
      code: '\n<table border="1" style="width: 100%; border-collapse: collapse; margin: 20px 0;">\n    <thead>\n        <tr>\n            <th style="padding: 8px; background-color: #f5f5f5;">Header 1</th>\n            <th style="padding: 8px; background-color: #f5f5f5;">Header 2</th>\n        </tr>\n    </thead>\n    <tbody>\n        <tr>\n            <td style="padding: 8px;">Data 1</td>\n            <td style="padding: 8px;">Data 2</td>\n        </tr>\n    </tbody>\n</table>\n'
    },
    {
      name: 'Image',
      code: '\n<img src="image-url.jpg" alt="Beschrijving" style="max-width: 100%; height: auto;" />\n'
    },
    {
      name: 'List',
      code: '\n<ul>\n    <li>Item 1</li>\n    <li>Item 2</li>\n    <li>Item 3</li>\n</ul>\n'
    }
  ];

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <h2 className="text-xl font-semibold">HTML Document Builder</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? <Code className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showPreview ? 'Code' : 'Preview'}
          </Button>
          <Button variant="outline" onClick={handleSaveTemplate}>
            <Save className="h-4 w-4 mr-2" />
            Opslaan
          </Button>
          <Button onClick={handleExportHTML}>
            <Download className="h-4 w-4 mr-2" />
            Export HTML
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* Code Snippets */}
        <div className="col-span-2">
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">HTML Snippets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {snippets.map((snippet) => (
                <Button
                  key={snippet.name}
                  variant="outline"
                  className="w-full justify-start text-sm"
                  onClick={() => insertSnippet(snippet.code)}
                >
                  {snippet.name}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Editor */}
        <div className="col-span-10">
          {showPreview ? (
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Live Preview</CardTitle>
              </CardHeader>
              <CardContent className="h-full p-0">
                <iframe
                  srcDoc={htmlCode}
                  className="w-full h-full border-0"
                  title="HTML Preview"
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">HTML Code Editor</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-4">
                <Textarea
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  className="w-full h-full font-mono text-sm resize-none"
                  placeholder="Schrijf je HTML code hier..."
                  style={{ minHeight: '500px' }}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
