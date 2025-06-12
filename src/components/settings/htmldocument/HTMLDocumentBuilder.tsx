
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Save, 
  Download, 
  Upload,
  Plus,
  Type,
  Image as ImageIcon,
  Table,
  List,
  DivideSquare,
  MousePointer
} from 'lucide-react';
import { DocumentTemplate } from '../types/DocumentTemplate';
import { useDocumentContext } from '../contexts/DocumentContext';
import { DocumentPDFGenerator } from '../utils/PDFGenerator';
import { useToast } from '@/hooks/use-toast';

interface HTMLDocumentBuilderProps {
  editingDocument?: DocumentTemplate | null;
  onDocumentSaved?: (document: DocumentTemplate) => void;
}

const DEFAULT_INVOICE_TEMPLATE = `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Factuur</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: white; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
        .company-info { flex: 1; }
        .company-logo { width: 120px; height: auto; }
        .invoice-info { text-align: right; }
        .invoice-number { font-size: 24px; font-weight: bold; color: #3b82f6; }
        .customer-billing { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
        .section-title { font-weight: bold; margin-bottom: 10px; color: #374151; }
        .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .invoice-table th, .invoice-table td { border: 1px solid #d1d5db; padding: 12px; text-align: left; }
        .invoice-table th { background-color: #f3f4f6; font-weight: bold; }
        .totals { margin-top: 20px; text-align: right; }
        .total-row { display: flex; justify-content: flex-end; margin-bottom: 8px; }
        .total-label { width: 150px; text-align: right; margin-right: 20px; }
        .total-amount { width: 100px; text-align: right; font-weight: bold; }
        .final-total { font-size: 18px; border-top: 2px solid #3b82f6; padding-top: 8px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
    </style>
</head>
<body>
    <!-- Header met bedrijfsinfo -->
    <div class="header">
        <div class="company-info">
            <img src="{{COMPANY_LOGO}}" alt="Bedrijfslogo" class="company-logo" />
            <h1>{{COMPANY_NAME}}</h1>
            <p>{{COMPANY_ADDRESS}}</p>
            <p>{{COMPANY_POSTAL_CODE}} {{COMPANY_CITY}}</p>
            <p>Tel: {{COMPANY_PHONE}}</p>
            <p>Email: {{COMPANY_EMAIL}}</p>
        </div>
        <div class="invoice-info">
            <div class="invoice-number">Factuur {{INVOICE_NUMBER}}</div>
            <p><strong>Factuurdatum:</strong> {{INVOICE_DATE}}</p>
            <p><strong>Vervaldatum:</strong> {{DUE_DATE}}</p>
        </div>
    </div>

    <!-- Klant- en factuurgegevens -->
    <div class="customer-billing">
        <div>
            <div class="section-title">Factuuradres:</div>
            <div>{{CUSTOMER_NAME}}</div>
            <div>{{CUSTOMER_ADDRESS}}</div>
            <div>{{CUSTOMER_POSTAL_CODE}} {{CUSTOMER_CITY}}</div>
        </div>
        <div>
            <div class="section-title">Betreft:</div>
            <div>{{INVOICE_SUBJECT}}</div>
        </div>
    </div>

    <!-- Factuurregels tabel -->
    <table class="invoice-table">
        <thead>
            <tr>
                <th>Omschrijving</th>
                <th>Aantal</th>
                <th>Prijs per stuk</th>
                <th>BTW %</th>
                <th>Totaal</th>
            </tr>
        </thead>
        <tbody>
            {{INVOICE_LINES}}
        </tbody>
    </table>

    <!-- Totalen -->
    <div class="totals">
        <div class="total-row">
            <div class="total-label">Subtotaal:</div>
            <div class="total-amount">€ {{SUBTOTAL}}</div>
        </div>
        <div class="total-row">
            <div class="total-label">BTW ({{VAT_PERCENTAGE}}%):</div>
            <div class="total-amount">€ {{VAT_AMOUNT}}</div>
        </div>
        <div class="total-row final-total">
            <div class="total-label">Totaal:</div>
            <div class="total-amount">€ {{TOTAL_AMOUNT}}</div>
        </div>
    </div>

    <!-- Footer -->
    <div class="footer">
        <p>Betaling binnen {{PAYMENT_TERMS}} dagen na factuurdatum.</p>
        <p>{{COMPANY_NAME}} | KvK: {{COMPANY_KVK}} | BTW-nr: {{COMPANY_VAT}}</p>
        <p>IBAN: {{COMPANY_IBAN}} | BIC: {{COMPANY_BIC}}</p>
    </div>
</body>
</html>`;

const SNIPPETS = [
  {
    category: 'Invoice Componenten',
    items: [
      { 
        name: 'Factuurregelbeispiel', 
        icon: <Table className="h-4 w-4" />,
        code: '<tr>\n    <td>{{DESCRIPTION}}</td>\n    <td>{{QUANTITY}}</td>\n    <td>€ {{UNIT_PRICE}}</td>\n    <td>{{VAT_RATE}}%</td>\n    <td>€ {{LINE_TOTAL}}</td>\n</tr>' 
      },
      { 
        name: 'Bedrijfslogo placeholder', 
        icon: <ImageIcon className="h-4 w-4" />,
        code: '<img src="{{COMPANY_LOGO}}" alt="Bedrijfslogo" class="company-logo" />' 
      },
      { 
        name: 'Klantadres sectie', 
        icon: <FileText className="h-4 w-4" />,
        code: '<div>\n    <div class="section-title">Factuuradres:</div>\n    <div>{{CUSTOMER_NAME}}</div>\n    <div>{{CUSTOMER_ADDRESS}}</div>\n    <div>{{CUSTOMER_POSTAL_CODE}} {{CUSTOMER_CITY}}</div>\n</div>' 
      }
    ]
  },
  {
    category: 'HTML Elementen',
    items: [
      { 
        name: 'Heading', 
        icon: <Type className="h-4 w-4" />,
        code: '<h2>Titel hier</h2>' 
      },
      { 
        name: 'Paragraaf', 
        icon: <Type className="h-4 w-4" />,
        code: '<p>Tekst hier</p>' 
      },
      { 
        name: 'Tabel', 
        icon: <Table className="h-4 w-4" />,
        code: '<table>\n    <thead>\n        <tr>\n            <th>Kolom 1</th>\n            <th>Kolom 2</th>\n        </tr>\n    </thead>\n    <tbody>\n        <tr>\n            <td>Data 1</td>\n            <td>Data 2</td>\n        </tr>\n    </tbody>\n</table>' 
      },
      { 
        name: 'Container Div', 
        icon: <DivideSquare className="h-4 w-4" />,
        code: '<div class="container">\n    <!-- Inhoud hier -->\n</div>' 
      },
      { 
        name: 'Lijst', 
        icon: <List className="h-4 w-4" />,
        code: '<ul>\n    <li>Item 1</li>\n    <li>Item 2</li>\n    <li>Item 3</li>\n</ul>' 
      }
    ]
  }
];

export const HTMLDocumentBuilder = ({ editingDocument, onDocumentSaved }: HTMLDocumentBuilderProps) => {
  const [htmlContent, setHtmlContent] = useState(DEFAULT_INVOICE_TEMPLATE);
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState<'factuur' | 'contract' | 'brief' | 'custom'>('factuur');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const { saveDocument, updateDocument } = useDocumentContext();
  const { toast } = useToast();

  // Load editing document
  useEffect(() => {
    if (editingDocument) {
      setDocumentName(editingDocument.name);
      setDocumentType(editingDocument.type);
      setHtmlContent(editingDocument.htmlContent || DEFAULT_INVOICE_TEMPLATE);
      setHasUnsavedChanges(false);
    } else {
      // New document
      setDocumentName('');
      setDocumentType('factuur');
      setHtmlContent(DEFAULT_INVOICE_TEMPLATE);
      setHasUnsavedChanges(false);
    }
  }, [editingDocument]);

  // Track unsaved changes
  useEffect(() => {
    if (editingDocument) {
      const hasChanges = 
        htmlContent !== (editingDocument.htmlContent || DEFAULT_INVOICE_TEMPLATE) ||
        documentName !== editingDocument.name ||
        documentType !== editingDocument.type;
      setHasUnsavedChanges(hasChanges);
    } else {
      // New document has changes if any field is filled
      const hasChanges = 
        htmlContent !== DEFAULT_INVOICE_TEMPLATE ||
        documentName.trim() !== '' ||
        documentType !== 'factuur';
      setHasUnsavedChanges(hasChanges);
    }
  }, [htmlContent, documentName, documentType, editingDocument]);

  const handleSave = () => {
    if (!documentName.trim()) {
      toast({
        title: "Fout",
        description: "Document naam is verplicht.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingDocument) {
        // Update existing document
        updateDocument(editingDocument.id, {
          name: documentName.trim(),
          type: documentType,
          htmlContent: htmlContent,
          description: `${documentType} document`
        });
        
        toast({
          title: "Opgeslagen",
          description: `Document "${documentName}" is bijgewerkt.`
        });
      } else {
        // Create new document
        const newDocumentData = {
          name: documentName.trim(),
          type: documentType,
          htmlContent: htmlContent,
          description: `${documentType} document`,
          lastModified: new Date(),
          isDefault: false
        };
        
        saveDocument(newDocumentData);
        
        toast({
          title: "Opgeslagen",
          description: `Nieuw document "${documentName}" is aangemaakt.`
        });

        // Call callback if provided
        if (onDocumentSaved) {
          const mockDocument: DocumentTemplate = {
            ...newDocumentData,
            id: Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date()
          };
          onDocumentSaved(mockDocument);
        }
      }
      
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het opslaan.",
        variant: "destructive"
      });
    }
  };

  const handlePDFDownload = () => {
    const fileName = documentName.trim() || 'document';
    DocumentPDFGenerator.generateFromHTML(htmlContent, fileName);
    toast({
      title: "PDF Download",
      description: `PDF wordt gedownload als "${fileName}.pdf"`
    });
  };

  const handleHTMLExport = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentName.trim() || 'document'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "HTML Export",
      description: "HTML bestand is gedownload."
    });
  };

  const insertSnippet = (code: string) => {
    const textarea = document.getElementById('html-editor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = htmlContent.slice(0, start) + code + htmlContent.slice(end);
      setHtmlContent(newContent);
      
      // Set cursor position after inserted code
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + code.length, start + code.length);
      }, 0);
    }
  };

  // Create scaled HTML content for iframe preview
  const getScaledHtmlContent = (content: string) => {
    // Extract the existing HTML content
    const htmlMatch = content.match(/<html[^>]*>([\s\S]*)<\/html>/i);
    if (!htmlMatch) return content;

    // Add scaling CSS to the existing content
    const scaledContent = content.replace(
      /<style[^>]*>([\s\S]*?)<\/style>/i,
      (match, styles) => {
        return `<style>
          ${styles}
          
          /* Scaling CSS to prevent scrollbars */
          html, body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            transform-origin: top left;
            transform: scale(0.85);
            width: 117.65%; /* 100% / 0.85 to compensate for scaling */
            height: 117.65%;
          }
        </style>`;
      }
    );

    return scaledContent;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with document controls */}
      <div className="flex-shrink-0 p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Input
              placeholder="Document naam..."
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              className="max-w-sm"
            />
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as any)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="factuur">Factuur</option>
              <option value="contract">Contract</option>
              <option value="brief">Brief</option>
              <option value="custom">Custom</option>
            </select>
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                Niet opgeslagen
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} size="sm" disabled={!documentName.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Opslaan
            </Button>
            <Button onClick={handlePDFDownload} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button onClick={handleHTMLExport} variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              HTML
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area - Editor en Preview naast elkaar */}
      <div className="flex-1 flex min-h-0">
        {/* Left sidebar with snippets */}
        <div className="w-80 border-r bg-muted/20 p-4 overflow-y-auto">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MousePointer className="h-4 w-4" />
            Code Snippets
          </h3>
          
          {SNIPPETS.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                {category.category}
              </h4>
              <div className="space-y-2">
                {category.items.map((snippet, index) => (
                  <button
                    key={index}
                    onClick={() => insertSnippet(snippet.code)}
                    className="w-full p-3 text-left bg-background hover:bg-accent rounded-lg border transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {snippet.icon}
                      <span className="text-sm font-medium">{snippet.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* HTML Editor en Preview - beide gelijke hoogte */}
        <div className="flex-1 flex">
          {/* HTML Editor - 50% breedte */}
          <div className="w-1/2 flex flex-col border-r">
            <div className="p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                HTML Editor
              </h3>
            </div>
            <div className="flex-1 p-4">
              <textarea
                id="html-editor"
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                className="w-full h-full font-mono text-sm border rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="HTML code hier..."
              />
            </div>
          </div>

          {/* Preview - 50% breedte, responsive A4 preview */}
          <div className="w-1/2 flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Document Preview</h3>
            </div>
            <div className="flex-1 p-4 overflow-hidden flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center">
                <div 
                  className="bg-white border rounded-lg shadow-sm"
                  style={{
                    aspectRatio: '210/297', // A4 aspect ratio
                    width: '95%',
                    maxHeight: '100%',
                    maxWidth: 'min(95%, calc(100vh * 210/297))', // Prevent it from being wider than viewport allows
                  }}
                >
                  <iframe
                    srcDoc={getScaledHtmlContent(htmlContent)}
                    className="w-full h-full border-0 rounded-lg"
                    title="Document Preview"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
