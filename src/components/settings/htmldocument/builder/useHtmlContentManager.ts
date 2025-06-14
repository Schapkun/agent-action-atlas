
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
  const previousDocumentName = useRef<string>('');
  const isInitializing = useRef(false);
  const hasInitialized = useRef(false);
  const lastLoadedContent = useRef<string>('');

  console.log('[HTML Manager] === RENDER START ===', {
    editingDocumentId: editingDocument?.id,
    editingDocumentName: editingDocument?.name,
    documentType,
    documentName,
    htmlContentLength: htmlContent.length,
    hasInitialized: hasInitialized.current,
    previousDocumentId: previousEditingDocumentId.current,
    previousDocumentName: previousDocumentName.current
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

  // Initialize or update content when document changes
  useEffect(() => {
    const currentId = editingDocument?.id;
    const currentName = editingDocument?.name || '';
    const hasDocumentChanged = currentId !== previousEditingDocumentId.current;
    const hasNameChanged = currentName !== previousDocumentName.current;
    
    console.log('[HTML Manager] Document effect triggered:', {
      currentId,
      currentName,
      hasDocumentChanged,
      hasNameChanged,
      hasInitialized: hasInitialized.current,
      isInitializing: isInitializing.current
    });

    // Initialize content on first load or when document actually changes
    if (!hasInitialized.current || hasDocumentChanged || hasNameChanged) {
      console.log('[HTML Manager] *** DOCUMENT LOADING TRIGGERED ***');
      isInitializing.current = true;
      
      const draftKey = getDraftKey(currentName);
      const draft = getDraft(draftKey);
      
      let newContent = '';
      
      console.log('[HTML Manager] Content priority check:', {
        hasSavedContent: !!editingDocument?.html_content,
        hasDraft: !!draft,
        draftKey
      });

      // Priority: 1. Saved document content, 2. Draft, 3. Default template
      if (editingDocument?.html_content) {
        console.log('[HTML Manager] ✅ Loading from saved document');
        newContent = editingDocument.html_content;
        // Clear any existing draft since we have saved content
        if (draft && currentName) {
          console.log('[HTML Manager] Clearing outdated draft');
          clearDraft(draftKey);
        }
      } else if (draft && editingDocument) {
        console.log('[HTML Manager] ✅ Loading from draft');
        newContent = draft;
      } else {
        console.log('[HTML Manager] ✅ Loading default template for type:', documentType);
        newContent = getTemplateForType(documentType);
      }
      
      console.log('[HTML Manager] *** SETTING NEW CONTENT ***', {
        contentLength: newContent.length,
        contentPreview: newContent.substring(0, 100),
        currentHtmlLength: htmlContent.length
      });

      setHtmlContent(newContent);
      lastLoadedContent.current = newContent;
      setHasUnsavedChanges(false);
      
      previousEditingDocumentId.current = currentId;
      previousDocumentName.current = currentName;
      hasInitialized.current = true;
      isInitializing.current = false;
      
      console.log('[HTML Manager] *** DOCUMENT LOADING COMPLETE ***');
    } else {
      console.log('[HTML Manager] No document change detected, skipping load');
    }
  }, [editingDocument?.id, editingDocument?.name, editingDocument?.html_content, documentType, setHtmlContent, setHasUnsavedChanges, getDraftKey, getDraft, getTemplateForType, clearDraft]);

  // Handle document type changes (only for user-initiated changes)
  useEffect(() => {
    console.log('[HTML Manager] Document type effect triggered:', {
      previousType: previousDocumentType.current,
      currentType: documentType,
      isInitializing: isInitializing.current,
      hasInitialized: hasInitialized.current
    });

    if (previousDocumentType.current !== null && 
        previousDocumentType.current !== documentType && 
        !isInitializing.current &&
        hasInitialized.current) {
      
      console.log('[HTML Manager] *** DOCUMENT TYPE CHANGED BY USER ***:', previousDocumentType.current, '->', documentType);
      
      const newContent = getTemplateForType(documentType);
      console.log('[HTML Manager] Setting new template content:', newContent.substring(0, 50));
      setHtmlContent(newContent);
      lastLoadedContent.current = newContent;
      setHasUnsavedChanges(true);
    }
    
    previousDocumentType.current = documentType;
  }, [documentType, getTemplateForType, setHtmlContent, setHasUnsavedChanges]);

  // Save draft on content changes (but not during initialization)
  useEffect(() => {
    console.log('[HTML Manager] Draft save effect triggered:', {
      documentName,
      isInitializing: isInitializing.current,
      hasHtmlContent: !!htmlContent,
      hasInitialized: hasInitialized.current,
      contentIsDifferent: htmlContent !== lastLoadedContent.current,
      lastLoadedLength: lastLoadedContent.current.length,
      currentContentLength: htmlContent.length
    });

    if (documentName && 
        !isInitializing.current && 
        htmlContent && 
        hasInitialized.current &&
        htmlContent !== lastLoadedContent.current) {
      console.log('[HTML Manager] *** SAVING DRAFT ***:', documentName);
      const draftKey = getDraftKey(documentName);
      saveDraft(draftKey, htmlContent);
    }
  }, [htmlContent, documentName, saveDraft, getDraftKey]);

  // Clear draft after successful save
  const clearDraftForDocument = useCallback((documentName: string) => {
    if (documentName) {
      const draftKey = getDraftKey(documentName);
      clearDraft(draftKey);
      lastLoadedContent.current = htmlContent; // Update the last loaded content reference
      console.log('[HTML Manager] *** CLEARED DRAFT FOR ***:', documentName);
    }
  }, [getDraftKey, clearDraft, htmlContent]);

  console.log('[HTML Manager] === RENDER END ===');

  return {
    clearDraftForDocument
  };
}
