
import React from 'react';
import { DocumentToolbar } from './builder/DocumentToolbar';
import { HtmlEditor } from './builder/HtmlEditor';
import { DocumentPreview } from './builder/DocumentPreview';
import { DialogFooter } from '@/components/settings/components/DialogFooter';
import { PreviewDialog } from './components/PreviewDialog';
import { PlaceholderSidebar } from './components/PlaceholderSidebar';
import { useHtmlDocumentBuilderV2 } from './builder/useHtmlDocumentBuilderV2';

interface HTMLDocumentBuilderV2Props {
  documentId?: string;
  onDocumentSaved?: (document: any) => void;
}

export const HTMLDocumentBuilderV2 = ({ documentId, onDocumentSaved }: HTMLDocumentBuilderV2Props) => {
  const {
    document,
    loading,
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
  } = useHtmlDocumentBuilderV2({ documentId, onDocumentSaved });

  // Handle type change (ensure string to DocumentTypeUI conversion)
  const handleSetDocumentType = (type: string) => {
    setDocumentType(type as any);
  };

  // Sidebar props
  const sidebarProps = {
    placeholderFields: PLACEHOLDER_FIELDS,
    placeholderValues,
    setPlaceholderValues,
    handleLogoUpload,
    snippets: SNIPPETS,
    insertSnippet,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Document laden...</div>
      </div>
    );
  }

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
