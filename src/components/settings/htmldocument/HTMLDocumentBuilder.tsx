
import React from 'react';
import { DocumentToolbar } from './builder/DocumentToolbar';
import { HtmlEditor } from './builder/HtmlEditor';
import { DocumentPreview } from './builder/DocumentPreview';
import { DialogFooter } from '@/components/settings/components/DialogFooter';
import { PreviewDialog } from './components/PreviewDialog';
import { PlaceholderSidebar } from './components/PlaceholderSidebar';
import { useHtmlDocumentBuilder } from './builder/useHtmlDocumentBuilder';

interface HTMLDocumentBuilderProps {
  editingDocument?: any;
  onDocumentSaved?: (document: any) => void;
}

export const HTMLDocumentBuilder = ({ editingDocument, onDocumentSaved }: HTMLDocumentBuilderProps) => {
  const {
    htmlContent,
    setHtmlContent,
    documentName,
    setDocumentName,
    documentType,
    setDocumentType,
    hasUnsavedChanges,
    isSaving,
    isPreviewOpen,
    setIsPreviewOpen,
    placeholderValues,
    setPlaceholderValues,
    handleLogoUpload,
    SNIPPETS,
    handleSave,
    handleCancel,
    handlePDFDownload,
    handleHTMLExport,
    handlePreview,
    insertSnippet,
    getScaledHtmlContent,
    DOCUMENT_TYPE_OPTIONS,
    PLACEHOLDER_FIELDS,
  } = useHtmlDocumentBuilder({ editingDocument, onDocumentSaved });

  // Fix: Create wrapper for setDocumentType to accept string and convert to correct type
  const handleSetDocumentType = (type: string) => {
    console.log('[TOOLBAR select] setDocumentType called with:', type);
    setDocumentType(type as any); // Allow string to DocumentTypeUI. Type safety is ensured by valid options in select.
  };

  // Sidebar props (define once)
  const sidebarProps = {
    placeholderFields: PLACEHOLDER_FIELDS,
    placeholderValues,
    setPlaceholderValues,
    handleLogoUpload,
    snippets: SNIPPETS,
    insertSnippet,
  };

  console.log('[RENDER] HTMLDocumentBuilder: documentType:', documentType, 'editingDocument:', editingDocument);

  return (
    <div className="flex flex-col h-full">
      <DocumentToolbar
        documentName={documentName}
        setDocumentName={setDocumentName}
        documentType={documentType}
        setDocumentType={handleSetDocumentType}
        options={DOCUMENT_TYPE_OPTIONS}
        hasUnsavedChanges={hasUnsavedChanges}
        onPreview={handlePreview}
        onPDFDownload={handlePDFDownload}
        onHTMLExport={handleHTMLExport}
      />

      <div className="flex-1 flex min-h-0">
        <PlaceholderSidebar {...sidebarProps} />
        <div className="flex-1 flex">
          <HtmlEditor
            htmlContent={htmlContent}
            onChange={setHtmlContent}
          />
          <DocumentPreview
            htmlContent={htmlContent}
            getScaledHtmlContent={getScaledHtmlContent}
          />
        </div>
      </div>
      <DialogFooter
        onCancel={handleCancel}
        onSave={handleSave}
        saving={isSaving}
        saveText="Opslaan"
      />
      <PreviewDialog
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        htmlContent={htmlContent}
        documentName={documentName}
      />
    </div>
  );
};
