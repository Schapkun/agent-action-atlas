
import { useState, useCallback } from 'react';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { DocumentTypeUI } from './htmlDocumentConstants';
import { useDocumentContext } from '../../contexts/DocumentContext';
import { useSaveOperations } from './useSaveOperations';
import { useExportOperations } from './useExportOperations';
import { usePlaceholderReplacement } from './usePlaceholderReplacement';

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
  
  const { selectedOrganization, selectedWorkspace } = useDocumentContext();
  
  const saveOperations = useSaveOperations({
    selectedOrganization,
    selectedWorkspace
  });
  
  const exportOperations = useExportOperations();
  const { getScaledHtmlContent } = usePlaceholderReplacement({ placeholderValues });

  const handleSave = useCallback(async () => {
    if (!documentName.trim()) {
      alert('Voer een documentnaam in');
      return;
    }

    setIsSaving(true);
    try {
      const savedDocument = await saveOperations.saveDocument({
        id: editingDocument?.id,
        name: documentName,
        type: documentType,
        htmlContent,
        description: editingDocument?.description
      });

      if (savedDocument) {
        clearDraftForDocument(documentName);
        setHasUnsavedChanges(false);
        console.log('[Document Actions] Document saved successfully');
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
    editingDocument,
    saveOperations,
    clearDraftForDocument,
    setHasUnsavedChanges,
    onDocumentSaved
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
    exportOperations.downloadPDF(processedContent, documentName);
  }, [htmlContent, documentName, getScaledHtmlContent, exportOperations]);

  const handleHTMLExport = useCallback(() => {
    const processedContent = getScaledHtmlContent(htmlContent);
    exportOperations.exportHTML(processedContent, documentName);
  }, [htmlContent, documentName, getScaledHtmlContent, exportOperations]);

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
