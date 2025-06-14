
import { useEffect, useRef, useCallback } from 'react';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { DocumentTypeUI } from './htmlDocumentConstants';

interface UseDocumentLoaderProps {
  editingDocument?: DocumentTemplate | null;
  documentName: string;
  setHtmlContent: (content: string) => void;
  setHasUnsavedChanges: (value: boolean) => void;
  getDraftForDocument: () => string | null;
  getTemplateForType: (type: DocumentTypeUI) => string;
  updateLastSavedContent: (content: string) => void;
  documentType: DocumentTypeUI;
}

export function useDocumentLoader({
  editingDocument,
  documentName,
  setHtmlContent,
  setHasUnsavedChanges,
  getDraftForDocument,
  getTemplateForType,
  updateLastSavedContent,
  documentType
}: UseDocumentLoaderProps) {
  const previousEditingDocumentId = useRef<string | undefined>(undefined);
  const hasInitialized = useRef(false);

  console.log('[Document Loader] Current state:', {
    editingDocumentId: editingDocument?.id,
    documentType,
    documentName,
    hasInitialized: hasInitialized.current
  });

  const loadDocumentContent = useCallback(() => {
    console.log('[Document Loader] Loading document content');
    
    let newContent = '';
    
    // Priority: 1. Saved document content, 2. Draft, 3. Default template
    if (editingDocument?.html_content) {
      console.log('[Document Loader] Using saved document content');
      newContent = editingDocument.html_content;
    } else if (editingDocument && documentName) {
      const draft = getDraftForDocument();
      if (draft) {
        console.log('[Document Loader] Using draft content');
        newContent = draft;
      } else {
        console.log('[Document Loader] Using default template');
        newContent = getTemplateForType(documentType);
      }
    } else {
      console.log('[Document Loader] Using default template for new document');
      newContent = getTemplateForType(documentType);
    }
    
    console.log('[Document Loader] Setting content:', newContent.substring(0, 100) + '...');
    setHtmlContent(newContent);
    updateLastSavedContent(newContent);
    setHasUnsavedChanges(false);
  }, [editingDocument, documentName, documentType, getDraftForDocument, getTemplateForType, setHtmlContent, updateLastSavedContent, setHasUnsavedChanges]);

  // Handle document loading (when switching between different documents)
  useEffect(() => {
    const currentId = editingDocument?.id;
    const hasDocumentChanged = currentId !== previousEditingDocumentId.current;
    
    console.log('[Document Loader] Document change check:', {
      currentId,
      previousId: previousEditingDocumentId.current,
      hasDocumentChanged
    });

    if (hasDocumentChanged || !hasInitialized.current) {
      loadDocumentContent();
      previousEditingDocumentId.current = currentId;
      hasInitialized.current = true;
    }
  }, [editingDocument?.id, editingDocument?.html_content, loadDocumentContent]);

  return {
    loadDocumentContent,
    hasInitialized: hasInitialized.current
  };
}
