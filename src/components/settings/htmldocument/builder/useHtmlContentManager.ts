
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
  const previousEditingDocumentId = useRef<string | null>(null);
  const previousDocumentType = useRef<DocumentTypeUI | null>(null);
  const isInitializing = useRef(false);
  const userIsTyping = useRef(false);

  console.log('[HTML Manager] Render with:', {
    editingDocumentId: editingDocument?.id,
    documentType,
    documentName,
    htmlContentLength: htmlContent.length
  });

  // Get template content based on type
  const getTemplateForType = useCallback((type: DocumentTypeUI): string => {
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

  // Initialize content when document changes
  useEffect(() => {
    const currentId = editingDocument?.id ?? null;
    
    if (currentId !== previousEditingDocumentId.current) {
      console.log('[HTML Manager] Document changed, initializing content');
      isInitializing.current = true;
      
      const name = editingDocument?.name || '';
      const draftKey = getDraftKey(name);
      const draft = getDraft(draftKey);
      
      let newContent = '';
      if (draft) {
        console.log('[HTML Manager] Loading from draft');
        newContent = draft;
      } else if (editingDocument?.html_content) {
        console.log('[HTML Manager] Loading from saved document');
        newContent = editingDocument.html_content;
      } else {
        console.log('[HTML Manager] Loading default template');
        newContent = DEFAULT_INVOICE_TEMPLATE;
      }
      
      setHtmlContent(newContent);
      setHasUnsavedChanges(false);
      
      previousEditingDocumentId.current = currentId;
      isInitializing.current = false;
    }
  }, [editingDocument?.id, editingDocument?.name, editingDocument?.html_content, setHtmlContent, setHasUnsavedChanges, getDraftKey, getDraft]);

  // Handle document type changes (only for user-initiated changes)
  useEffect(() => {
    if (previousDocumentType.current !== null && 
        previousDocumentType.current !== documentType && 
        !isInitializing.current) {
      
      console.log('[HTML Manager] Document type changed by user:', previousDocumentType.current, '->', documentType);
      
      const newContent = getTemplateForType(documentType);
      setHtmlContent(newContent);
      setHasUnsavedChanges(true);
    }
    
    previousDocumentType.current = documentType;
  }, [documentType, getTemplateForType, setHtmlContent, setHasUnsavedChanges]);

  // Save draft on content changes (but not during initialization)
  useEffect(() => {
    if (documentName && !isInitializing.current && htmlContent) {
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
      console.log('[HTML Manager] Cleared draft for:', documentName);
    }
  }, [getDraftKey, clearDraft]);

  return {
    clearDraftForDocument
  };
}
