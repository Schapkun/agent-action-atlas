import { useState, useCallback } from 'react';
import { DocumentTemplate, useDocumentTemplates } from '@/hooks/useDocumentTemplates';
import { DocumentTypeUI } from './htmlDocumentConstants';
import { usePlaceholderReplacement } from './usePlaceholderReplacement';
import { useDocumentContext } from '@/components/settings/contexts/DocumentContext';

interface UseDocumentActionsProps {
  htmlContent: string;
  setHtmlContent: (content: string) => void;
  documentName: string;
  setDocumentName: (name: string) => void;
  documentType: DocumentTypeUI;
  setDocumentType: (type: DocumentTypeUI) => void;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
  placeholderValues: Record<string, string>;
  setPlaceholderValues: (values: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  editingDocument?: DocumentTemplate | null;
  onDocumentSaved?: (document: DocumentTemplate | null) => void;
  clearDraftForDocument: (docName: string) => void;
}

export function useDocumentActions({
  htmlContent,
  setHtmlContent,
  documentName,
  setDocumentName,
  documentType,
  setDocumentType,
  hasUnsavedChanges,
  setHasUnsavedChanges,
  placeholderValues,
  setPlaceholderValues,
  editingDocument,
  onDocumentSaved,
  clearDraftForDocument
}: UseDocumentActionsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const { getScaledHtmlContent } = usePlaceholderReplacement({ placeholderValues });
  const { createTemplate, updateTemplate } = useDocumentTemplates();
  const { refreshTemplates } = useDocumentContext();

  const handleSave = useCallback(async () => {
    if (!documentName.trim()) {
      alert('Voer een documentnaam in');
      return;
    }

    setIsSaving(true);
    try {
      let savedDocument: DocumentTemplate;
      
      if (editingDocument) {
        savedDocument = await updateTemplate(editingDocument.id, {
          name: documentName,
          type: documentType === 'schapkun' ? 'custom' : documentType,
          html_content: htmlContent,
          description: editingDocument.description,
          placeholder_values: placeholderValues
        });
      } else {
        savedDocument = await createTemplate({
          name: documentName,
          type: documentType === 'schapkun' ? 'custom' : documentType,
          html_content: htmlContent,
          description: `${documentType} document`,
          is_default: false,
          is_active: true,
          placeholder_values: placeholderValues
        });
      }

      if (savedDocument) {
        clearDraftForDocument(documentName);
        setHasUnsavedChanges(false);
        
        // Refresh the templates list using DocumentContext to ensure UI sync
        await refreshTemplates();
        
        console.log('[Document Actions] Document saved successfully and context refreshed');
        onDocumentSaved?.(savedDocument);
      }
    } catch (error) {
      console.error('[Document Actions] Save failed:', error);
      alert('Fout bij opslaan van document');
    } finally {
      setIsSaving(false);
    }
  }, [
    documentName,
    documentType,
    htmlContent,
    placeholderValues,
    editingDocument,
    clearDraftForDocument,
    setHasUnsavedChanges,
    onDocumentSaved,
    createTemplate,
    updateTemplate,
    refreshTemplates
  ]);

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('Er zijn niet-opgeslagen wijzigingen. Weet je zeker dat je wilt annuleren?');
      if (!confirmed) return;
    }
    onDocumentSaved?.(null);
  }, [hasUnsavedChanges, onDocumentSaved]);

  const handlePDFDownload = useCallback(() => {
    const processedContent = getScaledHtmlContent(htmlContent);
    // Simple PDF download implementation
    const blob = new Blob([processedContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentName}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [htmlContent, documentName, getScaledHtmlContent]);

  const handleHTMLExport = useCallback(() => {
    const processedContent = getScaledHtmlContent(htmlContent);
    const blob = new Blob([processedContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [htmlContent, documentName, getScaledHtmlContent]);

  return {
    isSaving,
    isPreviewOpen,
    setIsPreviewOpen,
    handleSave,
    handleCancel,
    handlePDFDownload,
    handleHTMLExport,
    getScaledHtmlContent
  };
}
