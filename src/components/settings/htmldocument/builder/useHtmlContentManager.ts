
import { useEffect, useCallback } from 'react';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { DocumentTypeUI } from './htmlDocumentConstants';
import { useDraftManager } from './useDraftManager';
import { useTemplateManager } from './useTemplateManager';
import { useDocumentLoader } from './useDocumentLoader';

interface UseHtmlContentManagerProps {
  editingDocument?: DocumentTemplate | null;
  documentType: DocumentTypeUI;
  documentName: string;
  htmlContent: string;
  setHtmlContent: (content: string) => void;
  setHasUnsavedChanges: (value: boolean) => void;
  getDraftKey: (name: string) => string;
}

export function useHtmlContentManager({
  editingDocument,
  documentType,
  documentName,
  htmlContent,
  setHtmlContent,
  setHasUnsavedChanges,
  getDraftKey
}: UseHtmlContentManagerProps) {
  // Initialize focused hooks
  const draftManager = useDraftManager({ documentName, getDraftKey });
  
  const templateManager = useTemplateManager({
    documentType,
    setHtmlContent,
    setHasUnsavedChanges
  });

  const documentLoader = useDocumentLoader({
    editingDocument,
    documentName,
    setHtmlContent,
    setHasUnsavedChanges,
    getDraftForDocument: draftManager.getDraftForDocument,
    getTemplateForType: templateManager.getTemplateForType,
    updateLastSavedContent: templateManager.updateLastSavedContent,
    documentType
  });

  // Save draft on content changes
  useEffect(() => {
    if (documentName && 
        documentLoader.hasInitialized && 
        htmlContent && 
        htmlContent !== templateManager.lastSavedContent) {
      draftManager.saveDraftForDocument(htmlContent);
    }
  }, [htmlContent, documentName, documentLoader.hasInitialized, templateManager.lastSavedContent, draftManager]);

  // Clear draft after successful save - exposed to parent components
  const clearDraftForDocument = useCallback((docName: string) => {
    if (docName) {
      draftManager.clearDraftForDocument();
      templateManager.updateLastSavedContent(htmlContent);
      console.log('[HTML Content Manager] Cleared draft for:', docName);
    }
  }, [draftManager, templateManager, htmlContent]);

  return {
    clearDraftForDocument
  };
}
