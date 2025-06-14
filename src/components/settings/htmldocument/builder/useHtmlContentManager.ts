
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
  const isInitializing = useRef(false);
  const hasInitialized = useRef(false);

  console.log('[HTML Manager] Render with:', {
    editingDocumentId: editingDocument?.id,
    documentType,
    documentName,
    htmlContentLength: htmlContent.length,
    hasInitialized: hasInitialized.current
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

  // Initialize or update content when document changes
  useEffect(() => {
    const currentId = editingDocument?.id;
    const hasDocumentChanged = currentId !== previousEditingDocumentId.current;
    
    // Always initialize on first load, or when document actually changes
    if (!hasInitialized.current || hasDocumentChanged) {
      console.log('[HTML Manager] Document changed or first load, initializing content');
      isInitializing.current = true;
      
      const name = editingDocument?.name || '';
      const draftKey = getDraftKey(name);
      const draft = getDraft(draftKey);
      
      let newContent = '';
      
      // Priority: 1. Saved document content, 2. Draft, 3. Default template
      if (editingDocument?.html_content) {
        console.log('[HTML Manager] Loading from saved document (priority over draft)');
        newContent = editingDocument.html_content;
        // Clear any existing draft since we have saved content
        if (draft && name) {
          console.log('[HTML Manager] Clearing outdated draft, using saved content');
          clearDraft(draftKey);
        }
      } else if (draft && editingDocument) {
        console.log('[HTML Manager] Loading from draft (no saved content)');
        newContent = draft;
      } else {
        console.log('[HTML Manager] Loading default template for type:', documentType);
        newContent = getTemplateForType(documentType);
      }
      
      // Only update if content is different to prevent unnecessary re-renders
      if (newContent !== htmlContent) {
        setHtmlContent(newContent);
      }
      setHasUnsavedChanges(false);
      
      previousEditingDocumentId.current = currentId;
      hasInitialized.current = true;
      isInitializing.current = false;
    }
  }, [editingDocument?.id, editingDocument?.name, editingDocument?.html_content, documentType, htmlContent, setHtmlContent, setHasUnsavedChanges, getDraftKey, getDraft, getTemplateForType, clearDraft]);

  // Handle document type changes (only for user-initiated changes)
  useEffect(() => {
    if (previousDocumentType.current !== null && 
        previousDocumentType.current !== documentType && 
        !isInitializing.current &&
        hasInitialized.current) {
      
      console.log('[HTML Manager] Document type changed by user:', previousDocumentType.current, '->', documentType);
      
      const newContent = getTemplateForType(documentType);
      setHtmlContent(newContent);
      setHasUnsavedChanges(true);
    }
    
    previousDocumentType.current = documentType;
  }, [documentType, getTemplateForType, setHtmlContent, setHasUnsavedChanges]);

  // Save draft on content changes (but not during initialization)
  useEffect(() => {
    if (documentName && !isInitializing.current && htmlContent && hasInitialized.current) {
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
