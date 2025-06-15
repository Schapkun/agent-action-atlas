import { useState, useEffect, useCallback, useRef } from 'react';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { 
  DocumentTypeUI,
  DEFAULT_INVOICE_TEMPLATE,
  DEFAULT_PLACEHOLDER_VALUES,
  schapkunTemplate
} from './htmlDocumentConstants';

interface UseSimpleDocumentBuilderProps {
  editingDocument?: DocumentTemplate | null;
}

export function useSimpleDocumentBuilder({ editingDocument }: UseSimpleDocumentBuilderProps) {
  // Core state
  const [htmlContent, setHtmlContent] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState<DocumentTypeUI>('factuur');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>(DEFAULT_PLACEHOLDER_VALUES);
  
  // Control flags
  const [isInitialized, setIsInitialized] = useState(false);
  const previousDocumentType = useRef<DocumentTypeUI>('factuur');
  const previousEditingDocumentId = useRef<string | undefined>(undefined);
  const lastSavedContent = useRef('');

  // Map database types to UI types
  const mapDatabaseTypeToUI = (dbType: string): DocumentTypeUI => {
    switch (dbType) {
      case 'schapkun':
        return 'schapkun';
      case 'factuur':
        return 'factuur';
      case 'contract':
        return 'contract';
      case 'brief':
        return 'brief';
      case 'custom':
        return 'custom';
      default:
        return 'custom';
    }
  };

  // Get template for document type
  const getTemplateForType = useCallback((type: DocumentTypeUI): string => {
    console.log('[Simple Builder] Getting template for type:', type);
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

  // Draft key generation
  const getDraftKey = useCallback((name: string) => `html_draft_${name}`, []);

  // Draft operations
  const saveDraft = useCallback((key: string, content: string) => {
    try {
      localStorage.setItem(key, content);
      console.log('[Simple Builder] Draft saved for key:', key);
    } catch (error) {
      console.error('[Simple Builder] Failed to save draft:', error);
    }
  }, []);

  const getDraft = useCallback((key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('[Simple Builder] Failed to get draft:', error);
      return null;
    }
  }, []);

  const clearDraft = useCallback((key: string) => {
    try {
      localStorage.removeItem(key);
      console.log('[Simple Builder] Draft cleared for key:', key);
    } catch (error) {
      console.error('[Simple Builder] Failed to clear draft:', error);
    }
  }, []);

  // Initialize document content
  const initializeDocument = useCallback(() => {
    console.log('[Simple Builder] Initializing document');
    
    let newContent = '';
    let newName = '';
    let newType: DocumentTypeUI = 'factuur';
    let newPlaceholderValues = DEFAULT_PLACEHOLDER_VALUES;

    if (editingDocument) {
      // Load existing document
      newName = editingDocument.name;
      newType = mapDatabaseTypeToUI(editingDocument.type); // Use mapping function
      
      // Load saved placeholder values if they exist
      if (editingDocument.placeholder_values) {
        newPlaceholderValues = {
          ...DEFAULT_PLACEHOLDER_VALUES,
          ...editingDocument.placeholder_values
        };
      }
      
      if (editingDocument.html_content) {
        newContent = editingDocument.html_content;
        console.log('[Simple Builder] Using saved document content');
      } else {
        // Check for draft
        const draftKey = getDraftKey(newName);
        const draft = getDraft(draftKey);
        if (draft) {
          newContent = draft;
          console.log('[Simple Builder] Using draft content');
        } else {
          newContent = getTemplateForType(newType);
          console.log('[Simple Builder] Using default template');
        }
      }
    } else {
      // New document - initialize with example values
      newName = 'Nieuw Document';
      newType = 'factuur';
      newContent = getTemplateForType(newType);
      newPlaceholderValues = DEFAULT_PLACEHOLDER_VALUES;
      console.log('[Simple Builder] Creating new document with example data');
    }

    setDocumentName(newName);
    setDocumentType(newType);
    setHtmlContent(newContent);
    setPlaceholderValues(newPlaceholderValues);
    lastSavedContent.current = newContent;
    setHasUnsavedChanges(false);
    setIsInitialized(true);

    previousDocumentType.current = newType;
    previousEditingDocumentId.current = editingDocument?.id;
  }, [editingDocument, getDraftKey, getDraft, getTemplateForType]);

  // Handle template type changes
  const handleDocumentTypeChange = useCallback((newType: DocumentTypeUI) => {
    console.log('[Simple Builder] Document type changed to:', newType);
    
    if (newType === documentType) {
      console.log('[Simple Builder] Same type, no change needed');
      return;
    }

    const newContent = getTemplateForType(newType);
    setDocumentType(newType);
    setHtmlContent(newContent);
    lastSavedContent.current = newContent;
    setHasUnsavedChanges(true);
    
    console.log('[Simple Builder] Template switched to:', newType);
  }, [documentType, getTemplateForType]);

  // Initialize on mount or when editing document changes
  useEffect(() => {
    const hasDocumentChanged = editingDocument?.id !== previousEditingDocumentId.current;
    
    if (!isInitialized || hasDocumentChanged) {
      console.log('[Simple Builder] Document changed, reinitializing');
      initializeDocument();
    }
  }, [editingDocument?.id, isInitialized, initializeDocument]);

  // Save drafts on content change
  useEffect(() => {
    if (isInitialized && 
        documentName && 
        htmlContent && 
        htmlContent !== lastSavedContent.current) {
      
      const draftKey = getDraftKey(documentName);
      saveDraft(draftKey, htmlContent);
      setHasUnsavedChanges(true);
    }
  }, [htmlContent, documentName, isInitialized, getDraftKey, saveDraft]);

  // Clear draft for document
  const clearDraftForDocument = useCallback((docName: string) => {
    if (docName) {
      const draftKey = getDraftKey(docName);
      clearDraft(draftKey);
      lastSavedContent.current = htmlContent;
      setHasUnsavedChanges(false);
      console.log('[Simple Builder] Cleared draft for:', docName);
    }
  }, [getDraftKey, clearDraft, htmlContent]);

  return {
    // State
    htmlContent,
    setHtmlContent,
    documentName,
    setDocumentName,
    documentType,
    setDocumentType: handleDocumentTypeChange,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    placeholderValues,
    setPlaceholderValues,
    
    // Operations
    clearDraftForDocument,
    isInitialized
  };
}
