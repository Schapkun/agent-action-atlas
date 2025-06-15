
import { useState, useEffect, useCallback, useRef } from 'react';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { useTemporalDocument } from '../hooks/useTemporalDocument';
import { 
  DocumentTypeUI,
  DEFAULT_INVOICE_TEMPLATE,
  DEFAULT_PLACEHOLDER_VALUES,
  schapkunTemplate
} from './htmlDocumentConstants';

interface UseAtomicDocumentBuilderProps {
  documentId?: string;
}

export function useAtomicDocumentBuilder({ documentId }: UseAtomicDocumentBuilderProps) {
  const { document, loading, error, refreshDocument } = useTemporalDocument(documentId);
  
  // Local state with version tracking
  const [localState, setLocalState] = useState({
    htmlContent: '',
    documentName: '',
    documentType: 'factuur' as DocumentTypeUI,
    placeholderValues: DEFAULT_PLACEHOLDER_VALUES,
    hasUnsavedChanges: false,
    isInitialized: false
  });
  
  const lastInitializedVersion = useRef<number>(0);
  const lastSavedContent = useRef('');

  // Map database type to UI type
  const mapDatabaseTypeToUI = (dbType: string): DocumentTypeUI => {
    switch (dbType) {
      case 'schapkun': return 'schapkun';
      case 'factuur': return 'factuur';
      case 'contract': return 'contract';
      case 'brief': return 'brief';
      case 'custom': return 'custom';
      default: return 'custom';
    }
  };

  // Get template for document type
  const getTemplateForType = useCallback((type: DocumentTypeUI): string => {
    switch (type) {
      case 'schapkun': return schapkunTemplate;
      case 'factuur': return DEFAULT_INVOICE_TEMPLATE;
      case 'contract': return '<html><body><h1>Contract</h1><p>[Contract inhoud]</p></body></html>';
      case 'brief': return '<html><body><h1>Brief</h1><p>[Brief inhoud]</p></body></html>';
      case 'custom': return '<html><body><h1>Custom template</h1></body></html>';
      default: return DEFAULT_INVOICE_TEMPLATE;
    }
  }, []);

  // Initialize from document - only if we have a newer version
  useEffect(() => {
    const initializeFromDocument = () => {
      if (document) {
        console.log('[AtomicBuilder] Initializing from fresh document:', document.name);
        
        const newType = mapDatabaseTypeToUI(document.type);
        const newPlaceholderValues = {
          ...DEFAULT_PLACEHOLDER_VALUES,
          ...(document.placeholder_values || {})
        };
        
        let newContent = '';
        if (document.html_content && document.html_content.trim()) {
          newContent = document.html_content;
        } else {
          newContent = getTemplateForType(newType);
        }
        
        setLocalState({
          htmlContent: newContent,
          documentName: document.name,
          documentType: newType,
          placeholderValues: newPlaceholderValues,
          hasUnsavedChanges: false,
          isInitialized: true
        });
        
        lastSavedContent.current = newContent;
        
      } else if (!documentId) {
        // New document
        console.log('[AtomicBuilder] Initializing new document');
        const newContent = getTemplateForType('factuur');
        
        setLocalState({
          htmlContent: newContent,
          documentName: 'Nieuw Document',
          documentType: 'factuur',
          placeholderValues: DEFAULT_PLACEHOLDER_VALUES,
          hasUnsavedChanges: false,
          isInitialized: true
        });
        
        lastSavedContent.current = newContent;
      }
    };

    initializeFromDocument();
  }, [document, documentId, getTemplateForType]);

  // Listen for external document updates
  useEffect(() => {
    const handleDocumentUpdate = (event: CustomEvent) => {
      console.log('[AtomicBuilder] External document update received');
      // Document will be automatically updated through the useTemporalDocument hook
    };

    window.addEventListener('documentUpdated', handleDocumentUpdate as EventListener);
    return () => window.removeEventListener('documentUpdated', handleDocumentUpdate as EventListener);
  }, []);

  // Handle template type changes
  const handleDocumentTypeChange = useCallback((newType: DocumentTypeUI) => {
    if (newType === localState.documentType) return;

    if (document && localState.htmlContent !== lastSavedContent.current) {
      const confirmed = window.confirm(
        `Het wijzigen van het documenttype zal de huidige inhoud vervangen. Weet je zeker dat je doorgaat?`
      );
      if (!confirmed) return;
    }

    const newContent = getTemplateForType(newType);
    setLocalState(prev => ({
      ...prev,
      documentType: newType,
      htmlContent: newContent,
      hasUnsavedChanges: true
    }));
    lastSavedContent.current = newContent;
  }, [document, localState.documentType, localState.htmlContent, getTemplateForType]);

  // Track content changes
  const setHtmlContent = useCallback((content: string) => {
    setLocalState(prev => ({
      ...prev,
      htmlContent: content,
      hasUnsavedChanges: content !== lastSavedContent.current
    }));
  }, []);

  const setDocumentName = useCallback((name: string) => {
    setLocalState(prev => ({ ...prev, documentName: name, hasUnsavedChanges: true }));
  }, []);

  const setPlaceholderValues = useCallback((values: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => {
    setLocalState(prev => ({
      ...prev,
      placeholderValues: typeof values === 'function' ? values(prev.placeholderValues) : values,
      hasUnsavedChanges: true
    }));
  }, []);

  const clearDraftForDocument = useCallback(() => {
    lastSavedContent.current = localState.htmlContent;
    setLocalState(prev => ({ ...prev, hasUnsavedChanges: false }));
  }, [localState.htmlContent]);

  return {
    // Data
    document,
    loading,
    error,
    
    // Local state
    htmlContent: localState.htmlContent,
    setHtmlContent,
    documentName: localState.documentName,
    setDocumentName,
    documentType: localState.documentType,
    setDocumentType: handleDocumentTypeChange,
    hasUnsavedChanges: localState.hasUnsavedChanges,
    setHasUnsavedChanges: (value: boolean) => setLocalState(prev => ({ ...prev, hasUnsavedChanges: value })),
    placeholderValues: localState.placeholderValues,
    setPlaceholderValues,
    isInitialized: localState.isInitialized,
    
    // Operations
    clearDraftForDocument,
    refreshDocument
  };
}
