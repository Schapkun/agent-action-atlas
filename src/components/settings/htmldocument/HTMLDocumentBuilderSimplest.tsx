
import React from 'react';
import { DocumentToolbar } from './builder/DocumentToolbar';
import { HtmlEditor } from './builder/HtmlEditor';
import { DocumentPreview } from './builder/DocumentPreview';
import { DialogFooter } from '@/components/settings/components/DialogFooter';
import { PreviewDialog } from './components/PreviewDialog';
import { PlaceholderSidebar } from './components/PlaceholderSidebar';
import { useSimplestDocumentBuilder } from './builder/useSimplestDocumentBuilder';
import { usePlaceholderReplacement } from './builder/usePlaceholderReplacement';

interface HTMLDocumentBuilderSimplestProps {
  documentId?: string;
  onComplete?: (success: boolean) => void;
}

const SNIPPETS = [
  {
    category: 'Invoice Componenten',
    items: [
      { 
        name: 'Factuurregelbeispiel', 
        icon: null,
        code: '<tr>\n    <td>{{DESCRIPTION}}</td>\n    <td>{{QUANTITY}}</td>\n    <td>€ {{UNIT_PRICE}}</td>\n    <td>{{VAT_RATE}}%</td>\n    <td>€ {{LINE_TOTAL}}</td>\n</tr>' 
      },
      { 
        name: 'Bedrijfslogo placeholder', 
        icon: null,
        code: '<img src="{{COMPANY_LOGO}}" alt="Bedrijfslogo" class="company-logo" />' 
      },
      { 
        name: 'Klantadres sectie', 
        icon: null,
        code: '<div>\n    <div class="section-title">Factuuradres:</div>\n    <div>{{CUSTOMER_NAME}}</div>\n    <div>{{CUSTOMER_ADDRESS}}</div>\n    <div>{{CUSTOMER_POSTAL_CODE}} {{CUSTOMER_CITY}}</div>\n</div>' 
      }
    ]
  },
  {
    category: 'HTML Elementen',
    items: [
      { 
        name: 'Heading', 
        icon: null,
        code: '<h2>Titel hier</h2>' 
      },
      { 
        name: 'Paragraaf', 
        icon: null,
        code: '<p>Tekst hier</p>' 
      },
      { 
        name: 'Tabel', 
        icon: null,
        code: '<table>\n    <thead>\n        <tr>\n            <th>Kolom 1</th>\n            <th>Kolom 2</th>\n        </tr>\n    </thead>\n    <tbody>\n        <tr>\n            <td>Data 1</td>\n            <td>Data 2</td>\n        </tr>\n    </tbody>\n</table>' 
      }
    ]
  }
];

export const HTMLDocumentBuilderSimplest = ({ 
  documentId, 
  onComplete 
}: HTMLDocumentBuilderSimplestProps) => {
  const builder = useSimplestDocumentBuilder({ documentId, onComplete });
  const { getScaledHtmlContent } = usePlaceholderReplacement({ 
    placeholderValues: builder.placeholderValues 
  });

  // Handlers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      builder.setPlaceholderValues((prev) => ({
        ...prev,
        COMPANY_LOGO: ev.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const insertSnippet = (code: string) => {
    const textarea = document.getElementById('html-editor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = builder.htmlContent.slice(0, start) + code + builder.htmlContent.slice(end);
      builder.setHtmlContent(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + code.length, start + code.length);
      }, 0);
    }
  };

  const handlePreview = () => {
    builder.setIsPreviewOpen(true);
  };

  const handlePDFDownload = () => {
    const processedContent = getScaledHtmlContent(builder.htmlContent);
    const blob = new Blob([processedContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${builder.documentName}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleHTMLExport = () => {
    const processedContent = getScaledHtmlContent(builder.htmlContent);
    const blob = new Blob([processedContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${builder.documentName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (builder.loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Document laden...</div>
      </div>
    );
  }

  if (builder.error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-red-600">Fout: {builder.error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <DocumentToolbar
        documentName={builder.documentName}
        setDocumentName={builder.setDocumentName}
        documentType={builder.documentType}
        setDocumentType={builder.setDocumentType}
        options={builder.DOCUMENT_TYPE_OPTIONS}
        hasUnsavedChanges={builder.hasUnsavedChanges}
        onPreview={handlePreview}
        onPDFDownload={handlePDFDownload}
        onHTMLExport={handleHTMLExport}
      />

      <div className="flex-1 flex min-h-0">
        <PlaceholderSidebar
          placeholderFields={builder.PLACEHOLDER_FIELDS}
          placeholderValues={builder.placeholderValues}
          setPlaceholderValues={builder.setPlaceholderValues}
          handleLogoUpload={handleLogoUpload}
          snippets={SNIPPETS}
          insertSnippet={insertSnippet}
        />
        
        <div className="flex-1 flex">
          <HtmlEditor
            htmlContent={builder.htmlContent}
            onChange={builder.setHtmlContent}
          />
          <DocumentPreview
            htmlContent={builder.htmlContent}
            getScaledHtmlContent={getScaledHtmlContent}
          />
        </div>
      </div>
      
      <DialogFooter
        onCancel={builder.handleCancel}
        onSave={builder.handleSave}
        saving={builder.isSaving}
        saveText="Opslaan"
      />
      
      <PreviewDialog
        isOpen={builder.isPreviewOpen}
        onClose={() => builder.setIsPreviewOpen(false)}
        htmlContent={builder.htmlContent}
        documentName={builder.documentName}
      />
    </div>
  );
};
