
import { useEffect, useRef, useCallback } from 'react';
import { 
  DEFAULT_INVOICE_TEMPLATE,
  DocumentTypeUI,
  schapkunTemplate
} from './htmlDocumentConstants';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { useHtmlDraft } from './useHtmlDraft';

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
  const { saveDraft, getDraft, clearDraft } = useHtmlDraft();
  const previousEditingDocumentId = useRef<string | undefined>(undefined);
  const previousDocumentType = useRef<DocumentTypeUI | null>(null);
  const hasInitialized = useRef(false);
  const lastSavedContent = useRef<string>('');

  console.log('[HTML Manager] Current state:', {
    editingDocumentId: editingDocument?.id,
    documentType,
    documentName,
    htmlContentLength: htmlContent.length,
    hasInitialized: hasInitialized.current
  });

  // Get template content based on type
  const getTemplateForType = useCallback((type: DocumentTypeUI): string => {
    console.log('[HTML Manager] Getting template for type:', type);
    switch (type) {
      case 'schapkun':
        return schapkunTemplate;
      case 'factuur':
        return DEFAULT_INVOICE_TEMPLATE;
      case 'contract':
        return '<html><body><h1>Contract</h1><p>[Contract inhoud]</p></body></html>';
      case 'brief':
        return '<html><body><h1>Brief</h1><p>[Brief inhoud]</p></body></html>';
      case 'custom':
        return '<html><body><h1>Custom template</h1></body></html>';
      default:
        return DEFAULT_INVOICE_TEMPLATE;
    }
  }, []);

  // Handle document loading (when switching between different documents)
  useEffect(() => {
    const currentId = editingDocument?.id;
    const hasDocumentChanged = currentId !== previousEditingDocumentId.current;
    
    console.log('[HTML Manager] Document change check:', {
      currentId,
      previousId: previousEditingDocumentId.current,
      hasDocumentChanged
    });

    if (hasDocumentChanged || !hasInitialized.current) {
      console.log('[HTML Manager] Loading document content');
      
      let newContent = '';
      
      // Priority: 1. Saved document content, 2. Draft, 3. Default template
      if (editingDocument?.html_content) {
        console.log('[HTML Manager] Using saved document content');
        newContent = editingDocument.html_content;
      } else if (editingDocument && documentName) {
        const draftKey = getDraftKey(documentName);
        const draft = getDraft(draftKey);
        if (draft) {
          console.log('[HTML Manager] Using draft content');
          newContent = draft;
        } else {
          console.log('[HTML Manager] Using default template');
          newContent = getTemplateForType(documentType);
        }
      } else {
        console.log('[HTML Manager] Using default template for new document');
        newContent = getTemplateForType(documentType);
      }
      
      console.log('[HTML Manager] Setting content:', newContent.substring(0, 100) + '...');
      setHtmlContent(newContent);
      lastSavedContent.current = newContent;
      setHasUnsavedChanges(false);
      
      previousEditingDocumentId.current = currentId;
      hasInitialized.current = true;
    }
  }, [editingDocument?.id, editingDocument?.html_content, documentType, documentName, setHtmlContent, setHasUnsavedChanges, getDraftKey, getDraft, getTemplateForType]);

  // Handle document type changes (template switching)
  useEffect(() => {
    const hasTypeChanged = previousDocumentType.current !== null && 
                          previousDocumentType.current !== documentType;
    
    console.log('[HTML Manager] Type change check:', {
      previousType: previousDocumentType.current,
      currentType: documentType,
      hasTypeChanged,
      hasInitialized: hasInitialized.current
    });

    if (hasTypeChanged && hasInitialized.current) {
      console.log('[HTML Manager] *** TEMPLATE TYPE CHANGED ***:', previousDocumentType.current, '->', documentType);
      
      const newContent = getTemplateForType(documentType);
      console.log('[HTML Manager] Setting new template content');
      setHtmlContent(newContent);
      lastSavedContent.current = newContent;
      setHasUnsavedChanges(true);
    }
    
    previousDocumentType.current = documentType;
  }, [documentType, getTemplateForType, setHtmlContent, setHasUnsavedChanges]);

  // Save draft on content changes
  useEffect(() => {
    if (documentName && 
        hasInitialized.current && 
        htmlContent && 
        htmlContent !== lastSavedContent.current) {
      console.log('[HTML Manager] Saving draft for:', documentName);
      const draftKey = getDraftKey(documentName);
      saveDraft(draftKey, htmlContent);
    }
  }, [htmlContent, documentName, saveDraft, getDraftKey]);

  // Clear draft after successful save
  const clearDraftForDocument = useCallback((documentName: string) => {
    if (documentName) {
      const draftKey = getDraftKey(documentName);
      clearDraft(draftKey);
      lastSavedContent.current = htmlContent;
      console.log('[HTML Manager] Cleared draft for:', documentName);
    }
  }, [getDraftKey, clearDraft, htmlContent]);

  return {
    clearDraftForDocument
  };
}
