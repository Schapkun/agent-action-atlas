
import { useState, useEffect, useCallback, useRef } from 'react';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { supabase } from '@/integrations/supabase/client';
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
  const previousUniqueKey = useRef<string | undefined>(undefined);
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

  // Validate document freshness against database
  const validateDocumentFreshness = async (documentId: string, currentUpdatedAt: string): Promise<DocumentTemplate | null> => {
    try {
      console.log('[Simple Builder] Validating document freshness for:', documentId);
      
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('id', documentId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.error('[Simple Builder] Could not fetch document for validation:', error);
        return null;
      }

      const dbDocument: DocumentTemplate = {
        ...data,
        type: data.type as 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun',
        placeholder_values: data.placeholder_values ? 
          (typeof data.placeholder_values === 'object' && data.placeholder_values !== null ? 
            data.placeholder_values as Record<string, string> : null) : null
      };

      // Compare timestamps
      if (dbDocument.updated_at !== currentUpdatedAt) {
        console.log('[Simple Builder] Database has newer version:', dbDocument.updated_at, 'vs', currentUpdatedAt);
        return dbDocument;
      }

      console.log('[Simple Builder] Document is up to date');
      return null;
    } catch (error) {
      console.error('[Simple Builder] Error validating document freshness:', error);
      return null;
    }
  };

  // Simple database type to UI type mapping
  const mapDatabaseTypeToUI = (dbType: string): DocumentTypeUI => {
    console.log('[Simple Builder] Mapping DB type:', dbType);
    
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

  // Initialize document content - ALWAYS preserve database content
  const initializeDocument = useCallback(async () => {
    console.log('[Simple Builder] INITIALIZING document from database - completely fresh start');
    
    let finalDocument = editingDocument;

    // If editing existing document, validate freshness
    if (editingDocument && editingDocument.id && editingDocument.updated_at) {
      const newerDocument = await validateDocumentFreshness(editingDocument.id, editingDocument.updated_at);
      if (newerDocument) {
        console.log('[Simple Builder] Using newer document from database validation');
        finalDocument = newerDocument;
      }
    }
    
    let newContent = '';
    let newName = '';
    let newType: DocumentTypeUI = 'factuur';
    let newPlaceholderValues = DEFAULT_PLACEHOLDER_VALUES;

    if (finalDocument) {
      newName = finalDocument.name;
      newType = mapDatabaseTypeToUI(finalDocument.type);
      
      // Load saved placeholder values if they exist
      if (finalDocument.placeholder_values) {
        newPlaceholderValues = {
          ...DEFAULT_PLACEHOLDER_VALUES,
          ...finalDocument.placeholder_values
        };
      }
      
      // CRITICAL: ALWAYS preserve database content, never replace with template
      if (finalDocument.html_content && finalDocument.html_content.trim()) {
        newContent = finalDocument.html_content;
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

    // Update all tracking refs
    previousEditingDocumentId.current = finalDocument?.id;
    previousUpdatedAt.current = finalDocument?.updated_at;
    previousForceRefresh.current = (finalDocument as any)?._forceRefresh;
    previousUniqueKey.current = (finalDocument as any)?._uniqueKey;
    
    console.log('[Simple Builder] Document initialized with type:', newType, 'name:', newName, 'content length:', newContent.length);
    console.log('[Simple Builder] Force refresh key:', previousForceRefresh.current, 'Unique key:', previousUniqueKey.current);
  }, [editingDocument, getTemplateForType, mapDatabaseTypeToUI]);

  // Handle template type changes - preserve content when possible
  const handleDocumentTypeChange = useCallback((newType: DocumentTypeUI) => {
    console.log('[Simple Builder] Document type changed to:', newType, 'from:', documentType);
    
    if (newType === documentType) {
      console.log('[Simple Builder] Same type, no change needed');
      return;
    }

    // When editing existing document, warn about content replacement
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

  // Initialize on mount or when editing document changes OR any tracking value changes
  useEffect(() => {
    const hasDocumentChanged = editingDocument?.id !== previousEditingDocumentId.current;
    const hasContentUpdated = editingDocument?.updated_at !== previousUpdatedAt.current;
    const hasForceRefresh = (editingDocument as any)?._forceRefresh !== previousForceRefresh.current;
    const hasUniqueKeyChanged = (editingDocument as any)?._uniqueKey !== previousUniqueKey.current;
    
    if (!isInitialized || hasDocumentChanged || hasContentUpdated || hasForceRefresh || hasUniqueKeyChanged) {
      console.log('[Simple Builder] COMPLETE REFRESH TRIGGERED - reinitializing from database');
      console.log('[Simple Builder] Document changed:', hasDocumentChanged, 'Content updated:', hasContentUpdated, 'Force refresh:', hasForceRefresh, 'Unique key changed:', hasUniqueKeyChanged);
      initializeDocument();
    }
  }, [editingDocument?.id, editingDocument?.updated_at, (editingDocument as any)?._forceRefresh, (editingDocument as any)?._uniqueKey, isInitialized, initializeDocument]);

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
