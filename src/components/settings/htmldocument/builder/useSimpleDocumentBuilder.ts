
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

  // Map database types to UI types
  const mapDatabaseTypeToUI = (dbType: string, htmlContent?: string): DocumentTypeUI => {
    console.log('[Simple Builder] Mapping DB type:', dbType, 'with HTML check');
    
    if (dbType === 'schapkun') return 'schapkun';
    if (htmlContent && htmlContent.includes('schapkun')) return 'schapkun';
    
    switch (dbType) {
      case 'factuur': return 'factuur';
      case 'contract': return 'contract';
      case 'brief': return 'brief';
      case 'custom': return 'custom';
      default: return 'custom';
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

  // Initialize document content - ALWAYS from database, never from localStorage
  const initializeDocument = useCallback(() => {
    console.log('[Simple Builder] Initializing document from database only');
    
    let newContent = '';
    let newName = '';
    let newType: DocumentTypeUI = 'factuur';
    let newPlaceholderValues = DEFAULT_PLACEHOLDER_VALUES;

    if (editingDocument) {
      // ALWAYS load from database, never from drafts
      newName = editingDocument.name;
      newType = mapDatabaseTypeToUI(editingDocument.type, editingDocument.html_content);
      
      console.log('[Simple Builder] Loading from database:', editingDocument.name, 'Type:', newType);
      
      // Load saved placeholder values if they exist
      if (editingDocument.placeholder_values) {
        newPlaceholderValues = {
          ...DEFAULT_PLACEHOLDER_VALUES,
          ...editingDocument.placeholder_values
        };
      }
      
      // ALWAYS use database content, never drafts
      if (editingDocument.html_content) {
        newContent = editingDocument.html_content;
        console.log('[Simple Builder] Using database content, length:', newContent.length);
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
  }, [editingDocument, getTemplateForType]);

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
      console.log('[Simple Builder] Document changed, reinitializing from database');
      initializeDocument();
    }
  }, [editingDocument?.id, editingDocument?.updated_at, isInitialized, initializeDocument]);

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
