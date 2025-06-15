
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
  const previousEditingDocumentId = useRef<string | undefined>(undefined);
  const previousUpdatedAt = useRef<string | undefined>(undefined);
  const previousForceRefresh = useRef<string | undefined>(undefined);
  const lastSavedContent = useRef('');

  // Clear any existing localStorage drafts on mount
  useEffect(() => {
    console.log('[Simple Builder] Clearing localStorage drafts...');
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('html_draft_') || key.startsWith('builder_draft_')) {
        localStorage.removeItem(key);
        console.log('[Simple Builder] Cleared draft:', key);
      }
    });
  }, []);

  // FIXED: Simple database type to UI type mapping - don't auto-detect from content
  const mapDatabaseTypeToUI = (dbType: string): DocumentTypeUI => {
    console.log('[Simple Builder] Mapping DB type:', dbType);
    
    // Direct mapping without content analysis
    switch (dbType) {
      case 'schapkun':
        console.log('[Simple Builder] Mapped to schapkun');
        return 'schapkun';
      case 'factuur': 
        console.log('[Simple Builder] Mapped to factuur');
        return 'factuur';
      case 'contract': 
        console.log('[Simple Builder] Mapped to contract');
        return 'contract';
      case 'brief': 
        console.log('[Simple Builder] Mapped to brief');
        return 'brief';
      case 'custom': 
        console.log('[Simple Builder] Mapped to custom');
        return 'custom';
      default: 
        console.log('[Simple Builder] Defaulted to custom for type:', dbType);
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

  // FIXED: Initialize document content - ALWAYS preserve database content
  const initializeDocument = useCallback(() => {
    console.log('[Simple Builder] Initializing document from database only');
    
    let newContent = '';
    let newName = '';
    let newType: DocumentTypeUI = 'factuur';
    let newPlaceholderValues = DEFAULT_PLACEHOLDER_VALUES;

    if (editingDocument) {
      // ALWAYS load from database, never from drafts
      newName = editingDocument.name;
      
      // Simple type mapping without content detection
      newType = mapDatabaseTypeToUI(editingDocument.type);
      console.log('[Simple Builder] Final mapped type:', newType, 'from DB type:', editingDocument.type);
      
      // Load saved placeholder values if they exist
      if (editingDocument.placeholder_values) {
        newPlaceholderValues = {
          ...DEFAULT_PLACEHOLDER_VALUES,
          ...editingDocument.placeholder_values
        };
      }
      
      // CRITICAL: ALWAYS preserve database content, never replace with template
      if (editingDocument.html_content && editingDocument.html_content.trim()) {
        newContent = editingDocument.html_content;
        console.log('[Simple Builder] Using database content, length:', newContent.length, 'type:', newType);
      } else {
        newContent = getTemplateForType(newType);
        console.log('[Simple Builder] Using default template for type:', newType);
      }
    } else {
      // New document
      newName = 'Nieuw Document';
      newType = 'factuur';
      newContent = getTemplateForType(newType);
      newPlaceholderValues = DEFAULT_PLACEHOLDER_VALUES;
      console.log('[Simple Builder] Creating new document');
    }

    setDocumentName(newName);
    setDocumentType(newType);
    setHtmlContent(newContent);
    setPlaceholderValues(newPlaceholderValues);
    lastSavedContent.current = newContent;
    setHasUnsavedChanges(false);
    setIsInitialized(true);

    previousEditingDocumentId.current = editingDocument?.id;
    previousUpdatedAt.current = editingDocument?.updated_at;
    previousForceRefresh.current = (editingDocument as any)?._forceRefresh;
    
    console.log('[Simple Builder] Document initialized with type:', newType, 'name:', newName, 'content length:', newContent.length);
  }, [editingDocument, getTemplateForType, mapDatabaseTypeToUI]);

  // FIXED: Handle template type changes - preserve content when possible
  const handleDocumentTypeChange = useCallback((newType: DocumentTypeUI) => {
    console.log('[Simple Builder] Document type changed to:', newType, 'from:', documentType);
    
    if (newType === documentType) {
      console.log('[Simple Builder] Same type, no change needed');
      return;
    }

    // CRITICAL: When editing existing document, warn about content replacement
    if (editingDocument && htmlContent !== lastSavedContent.current) {
      const confirmed = window.confirm(
        `Het wijzigen van het documenttype zal de huidige inhoud vervangen met een nieuw template. ` +
        `Weet je zeker dat je het type wilt wijzigen van "${documentType}" naar "${newType}"?`
      );
      if (!confirmed) {
        console.log('[Simple Builder] Type change cancelled by user');
        return;
      }
    }

    const newContent = getTemplateForType(newType);
    setDocumentType(newType);
    setHtmlContent(newContent);
    lastSavedContent.current = newContent;
    setHasUnsavedChanges(true);
    
    console.log('[Simple Builder] Template switched to:', newType, 'new content length:', newContent.length);
  }, [documentType, editingDocument, htmlContent, getTemplateForType]);

  // FIXED: Initialize on mount or when editing document changes OR when content is updated in database OR force refresh
  useEffect(() => {
    const hasDocumentChanged = editingDocument?.id !== previousEditingDocumentId.current;
    const hasContentUpdated = editingDocument?.updated_at !== previousUpdatedAt.current;
    const hasForceRefresh = (editingDocument as any)?._forceRefresh !== previousForceRefresh.current;
    
    if (!isInitialized || hasDocumentChanged || hasContentUpdated || hasForceRefresh) {
      console.log('[Simple Builder] Document changed, content updated, or force refresh triggered - reinitializing from database');
      console.log('[Simple Builder] Document changed:', hasDocumentChanged, 'Content updated:', hasContentUpdated, 'Force refresh:', hasForceRefresh);
      console.log('[Simple Builder] Previous updated_at:', previousUpdatedAt.current, 'New updated_at:', editingDocument?.updated_at);
      console.log('[Simple Builder] Previous force refresh:', previousForceRefresh.current, 'New force refresh:', (editingDocument as any)?._forceRefresh);
      initializeDocument();
    }
  }, [editingDocument?.id, editingDocument?.updated_at, (editingDocument as any)?._forceRefresh, isInitialized, initializeDocument]);

  // Track content changes for unsaved state
  useEffect(() => {
    if (isInitialized && 
        htmlContent && 
        htmlContent !== lastSavedContent.current) {
      setHasUnsavedChanges(true);
      console.log('[Simple Builder] Content changed, marking as unsaved');
    }
  }, [htmlContent, isInitialized]);

  // Simple clear function that just resets the unsaved state
  const clearDraftForDocument = useCallback((docName: string) => {
    console.log('[Simple Builder] Clearing unsaved changes for:', docName);
    lastSavedContent.current = htmlContent;
    setHasUnsavedChanges(false);
  }, [htmlContent]);

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
