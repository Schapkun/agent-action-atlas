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
  MousePointer,
  Eye
} from 'lucide-react';
import { useDocumentTemplates, DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { DocumentPDFGenerator } from '../utils/PDFGenerator';
import { useToast } from '@/hooks/use-toast';
import { PreviewDialog } from './components/PreviewDialog';
import { DialogFooter } from '@/components/settings/components/DialogFooter';
import { PlaceholderSidebar } from './components/PlaceholderSidebar';

interface HTMLDocumentBuilderProps {
  editingDocument?: DocumentTemplate | null;
  onDocumentSaved?: (document: DocumentTemplate) => void;
}

// --- AANGEPASTE DEFAULT PLACEHOLDER VALUES ---
const DEFAULT_PLACEHOLDER_VALUES: Record<string, string> = {
  COMPANY_LOGO: "", // base64 image url
  COMPANY_NAME: "Jansen B.V.",
  COMPANY_ADDRESS: "Straat 1",
  COMPANY_POSTAL_CODE: "1234 AB",
  COMPANY_CITY: "Amsterdam",
  COMPANY_PHONE: "06-12345678",
  COMPANY_EMAIL: "info@jansenbv.nl",
  COMPANY_KVK: "12345678",
  COMPANY_VAT: "NL001234567B01",
  COMPANY_IBAN: "NL91ABNA0417164300",
  COMPANY_BIC: "ABNANL2A",
  INVOICE_NUMBER: "2024-001",
  INVOICE_DATE: "14-06-2024",
  DUE_DATE: "28-06-2024",
  CUSTOMER_NAME: "Voorbeeld Klant B.V.",
  CUSTOMER_ADDRESS: "Voorbeeldstraat 123",
  CUSTOMER_POSTAL_CODE: "4321 BA",
  CUSTOMER_CITY: "Rotterdam",
  INVOICE_LINES:
    `<tr>
      <td>Consultancy diensten</td>
      <td>10</td>
      <td>€ 75,00</td>
      <td>21%</td>
      <td>€ 750,00</td>
    </tr>
    <tr>
      <td>Reiskosten</td>
      <td>1</td>
      <td>€ 50,00</td>
      <td>21%</td>
      <td>€ 50,00</td>
    </tr>`,
  SUBTOTAL: "800.00",
  VAT_PERCENTAGE: "21",
  VAT_AMOUNT: "168.00",
  TOTAL_AMOUNT: "968.00",
  INVOICE_SUBJECT: "Diensten maart",
  PAYMENT_TERMS: "30"
};

// --- VERBETERD: Voeg alle placeholders toe, inclusief alle bedrijfsinfo/velden ---
type PlaceholderField = {
  label: string;
  id: string;
  placeholder?: string;
  type?: "image";
};

const PLACEHOLDER_FIELDS: PlaceholderField[] = [
  { label: "Bedrijfslogo", id: "COMPANY_LOGO", type: "image", placeholder: "" },
  { label: "Bedrijfsnaam", id: "COMPANY_NAME", placeholder: "Bijv. Jansen B.V." },
  { label: "Adres", id: "COMPANY_ADDRESS", placeholder: "Bijv. Straat 1" },
  { label: "Postcode", id: "COMPANY_POSTAL_CODE", placeholder: "Bijv. 1234 AB" },
  { label: "Plaats", id: "COMPANY_CITY", placeholder: "Bijv. Amsterdam" },
  { label: "Telefoon", id: "COMPANY_PHONE", placeholder: "Bijv. 06-12345678" },
  { label: "E-mail", id: "COMPANY_EMAIL", placeholder: "Bijv. info@voorbeeld.nl" },
  { label: "KvK", id: "COMPANY_KVK", placeholder: "Bijv. 12345678" },
  { label: "BTW-nummer", id: "COMPANY_VAT", placeholder: "Bijv. NL001234567B01" },
  { label: "IBAN", id: "COMPANY_IBAN", placeholder: "Bijv. NL91ABNA0417164300" },
  { label: "BIC", id: "COMPANY_BIC", placeholder: "Bijv. ABNANL2A" },
  // Factuur/specifiek
  { label: "Factuurnummer", id: "INVOICE_NUMBER", placeholder: "Bijv. 2024-001" },
  { label: "Factuurdatum", id: "INVOICE_DATE", placeholder: "Bijv. 14-06-2024" },
  { label: "Vervaldatum", id: "DUE_DATE", placeholder: "Bijv. 28-06-2024" },
  { label: "Klantnaam", id: "CUSTOMER_NAME", placeholder: "Bijv. Jansen B.V." },
  { label: "Klantadres", id: "CUSTOMER_ADDRESS", placeholder: "Bijv. Straat 1" },
  { label: "Postcode klant", id: "CUSTOMER_POSTAL_CODE", placeholder: "Bijv. 1234 AB" },
  { label: "Plaats klant", id: "CUSTOMER_CITY", placeholder: "Bijv. Amsterdam" },
  { label: "Factuurregels (HTML)", id: "INVOICE_LINES", placeholder: "Automatisch gegenereerd" },
  { label: "Subtotaal", id: "SUBTOTAL", placeholder: "Bijv. 800.00" },
  { label: "BTW-percentage", id: "VAT_PERCENTAGE", placeholder: "Bijv. 21" },
  { label: "BTW-bedrag", id: "VAT_AMOUNT", placeholder: "Bijv. 168.00" },
  { label: "Totaalbedrag", id: "TOTAL_AMOUNT", placeholder: "Bijv. 968.00" },
  { label: "Orderomschrijving", id: "INVOICE_SUBJECT", placeholder: "Bijv. Diensten maart" },
  { label: "Betaaltermijn", id: "PAYMENT_TERMS", placeholder: "Bijv. 30" },
];

// --- KEY voor localStorage op basis van documentName ---
function getStorageKey(documentName: string) {
  return "html_doc_preview_" + (documentName?.trim().toLowerCase().replace(/\s+/g, "_") || "untitled");
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
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>(() => {
    // Probeer te laden uit localStorage, anders defaults
    const storageKey = getStorageKey(editingDocument?.name ?? "");
    const fromStorage = localStorage.getItem(storageKey);
    if (fromStorage) {
      return { ...DEFAULT_PLACEHOLDER_VALUES, ...JSON.parse(fromStorage) };
    }
    return DEFAULT_PLACEHOLDER_VALUES;
  });

  const { createTemplate, updateTemplate, fetchTemplates } = useDocumentTemplates();
  const { toast } = useToast();

  // Load editing document
  useEffect(() => {
    if (editingDocument) {
      setDocumentName(editingDocument.name);
      setDocumentType(editingDocument.type);
      setHtmlContent(editingDocument.html_content || DEFAULT_INVOICE_TEMPLATE);
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
        htmlContent !== (editingDocument.html_content || DEFAULT_INVOICE_TEMPLATE) ||
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

  // --- LOGO upload veld voor preview data (base64 opslaan in placeholder) ---
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev: any) => {
      setPlaceholderValues(old => ({ ...old, COMPANY_LOGO: ev.target.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!documentName.trim()) {
      toast({
        title: "Fout",
        description: "Document naam is verplicht.",
        variant: "destructive"
      });
      return;
    }

    if (isSaving) {
      return; // Prevent double saves
    }

    setIsSaving(true);

    try {
      let savedDocument: DocumentTemplate;

      if (editingDocument) {
        // Update existing document
        console.log('Updating document:', editingDocument.id);
        const updatedDoc = await updateTemplate(editingDocument.id, {
          name: documentName.trim(),
          type: documentType,
          html_content: htmlContent,
          description: `${documentType} document`
        });
        savedDocument = updatedDoc;
        
        toast({
          title: "Opgeslagen",
          description: `Document "${documentName}" is bijgewerkt.`
        });
      } else {
        // Create new document
        console.log('Creating new document');
        const newDocumentData = {
          name: documentName.trim(),
          type: documentType,
          html_content: htmlContent,
          description: `${documentType} document`,
          is_default: false,
          is_active: true
        };
        
        const newDoc = await createTemplate(newDocumentData);
        savedDocument = newDoc;
        
        toast({
          title: "Opgeslagen",
          description: `Nieuw document "${documentName}" is aangemaakt.`
        });
      }
      
      setHasUnsavedChanges(false);

      // Refresh the templates list to show the new/updated document
      await fetchTemplates();

      // Call callback if provided
      if (onDocumentSaved && savedDocument) {
        onDocumentSaved(savedDocument);
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het opslaan. Probeer het opnieuw.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!editingDocument) {
      // Voor nieuwe document reset localStorage
      localStorage.removeItem(getStorageKey(documentName));
    }
    if (onDocumentSaved) {
      onDocumentSaved(null as any); // Go back to list view
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

  const handlePreview = () => {
    setIsPreviewOpen(true);
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

  // Helper om placeholders te vervangen in de preview
  const replacePlaceholders = (content: string, forPreview = false) => {
    let replaced = content;
    PLACEHOLDER_FIELDS.forEach(({ id, type }) => {
      const regex = new RegExp(`{{${id}}}`, "g");
      if (forPreview && type === "image") {
        // Los alleen de src op.
        // Vervang: src="{{COMPANY_LOGO}}" -> src="data:image..."
        const srcRegex = new RegExp(`src=[\\"']{{${id}}}[\\"']`, "g");
        if (placeholderValues[id]) {
          replaced = replaced.replace(
            srcRegex,
            `src="${placeholderValues[id]}"`
          );
          // Als {{COMPANY_LOGO}} los voorkomt (zonder <img src=...), vervang hem door een plaatje
          replaced = replaced.replace(
            regex,
            `<img src="${placeholderValues[id]}" alt="Bedrijfslogo" style="width:120px;max-height:75px;object-fit:contain;" />`
          );
        } else {
          // Indien leeg, geef aan dat het logo ontbreekt
          replaced = replaced.replace(
            srcRegex,
            `src="" style="background:#eee;border:1px dashed #ccc;width:120px;max-height:75px;object-fit:contain;"`
          );
          replaced = replaced.replace(
            regex,
            `<span style="color:#ddd;">[Logo]</span>`
          );
        }
      } else {
        replaced = replaced.replace(
          regex,
          forPreview ? (placeholderValues[id] || `<span style="color:#9ca3af;">[${id}]</span>`) : `{{${id}}}`
        );
      }
    });
    return replaced;
  };

  // Pas de getScaledHtmlContent aan zodat hij met ingevulde waarden toont in de preview
  const getScaledHtmlContent = (content: string) => {
    const withValues = replacePlaceholders(content, true);

    // Extract the existing HTML content
    const htmlMatch = withValues.match(/<html[^>]*>([\s\S]*)<\/html>/i);
    if (!htmlMatch) return withValues;

    // Add scaling CSS to the existing content
    const scaledContent = withValues.replace(
      /<style[^>]*>([\s\S]*?)<\/style>/i,
      (match, styles) => {
        return `<style>
          ${styles}
          
          /* Scaling CSS to prevent scrollbars */
          html, body {
            margin: 0;
            padding: 25px;
            overflow: hidden;
            transform-origin: top left;
            transform: scale(0.85);
            width: 117.65%; /* 100% / 0.85 to compensate for scaling */
            height: 117.65%;
            box-sizing: border-box;
          }
        </style>`;
      }
    );

    return scaledContent;
  };

  // Sla placeholder waardes altijd meteen op (auto save elke wijziging)
  useEffect(() => {
    const key = getStorageKey(documentName);
    localStorage.setItem(key, JSON.stringify(placeholderValues));
  }, [placeholderValues, documentName]);

  // Sidebar props (define once)
  const sidebarProps = {
    placeholderFields: PLACEHOLDER_FIELDS,
    placeholderValues,
    setPlaceholderValues,
    handleLogoUpload,
    snippets: SNIPPETS,
    insertSnippet,
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
            <Button 
              onClick={handlePreview} 
              variant="outline" 
              size="sm"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
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
        {/* Left sidebar with placeholders and snippets */}
        <PlaceholderSidebar {...sidebarProps} />

        {/* HTML Editor en Preview */}
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

      {/* Footer with save and cancel buttons */}
      <DialogFooter
        onCancel={handleCancel}
        onSave={handleSave}
        saving={isSaving}
        saveText="Opslaan"
      />

      {/* Preview Dialog */}
      <PreviewDialog
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        htmlContent={htmlContent}
        documentName={documentName}
      />
    </div>
  );
};
