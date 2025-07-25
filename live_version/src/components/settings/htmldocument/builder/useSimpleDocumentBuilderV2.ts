
import { useState, useEffect, useCallback, useRef } from 'react';
import { useDocumentData } from '../hooks/useDocumentData';
import { 
  DocumentTypeUI,
  DEFAULT_INVOICE_TEMPLATE,
  DEFAULT_PLACEHOLDER_VALUES,
  schapkunTemplate
} from './htmlDocumentConstants';

// Import the DocumentTemplate type
import type { DocumentTemplate } from '@/hooks/useDocumentTemplatesCreate';

interface UseSimpleDocumentBuilderV2Props {
  documentId?: string;
  forceRefreshKey?: string; // Add force refresh key
}

export function useSimpleDocumentBuilderV2({ 
  documentId, 
  forceRefreshKey 
}: UseSimpleDocumentBuilderV2Props) {
  // Document data fetching - fix the hook call
  const { document, loading, error } = useDocumentData(documentId);
  
  // Builder state
  const [htmlContent, setHtmlContent] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState<DocumentTypeUI>('factuur');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>(DEFAULT_PLACEHOLDER_VALUES);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const lastSavedContent = useRef('');

  // Map database type to UI type - use labels instead
  const getDocumentTypeFromLabels = (labels?: any[]): DocumentTypeUI => {
    if (!labels || labels.length === 0) return 'custom';
    
    const labelNames = labels.map(label => label.name.toLowerCase());
    if (labelNames.includes('schapkun')) return 'schapkun';
    if (labelNames.includes('factuur')) return 'factuur';
    if (labelNames.includes('contract')) return 'contract';
    if (labelNames.includes('brief')) return 'brief';
    return 'custom';
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

  // Initialize from document data
  useEffect(() => {
    if (document) {
      console.log('[Builder V2] Initializing from document data:', forceRefreshKey);
      
      const newType = getDocumentTypeFromLabels((document as any).labels);
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
      
      setDocumentName(document.name);
      setDocumentType(newType);
      setHtmlContent(newContent);
      setPlaceholderValues(newPlaceholderValues);
      lastSavedContent.current = newContent;
      setHasUnsavedChanges(false);
      setIsInitialized(true);
      
      console.log('[Builder V2] Initialized with type:', newType, 'content length:', newContent.length);
    } else if (!documentId) {
      // New document
      console.log('[Builder V2] Initializing new document with force refresh key:', forceRefreshKey);
      
      const newContent = getTemplateForType('factuur');
      setDocumentName('Nieuw Document');
      setDocumentType('factuur');
      setHtmlContent(newContent);
      setPlaceholderValues(DEFAULT_PLACEHOLDER_VALUES);
      lastSavedContent.current = newContent;
      setHasUnsavedChanges(false);
      setIsInitialized(true);
    }
  }, [document, documentId, forceRefreshKey, getTemplateForType]);

  // Handle template type changes
  const handleDocumentTypeChange = useCallback((newType: DocumentTypeUI) => {
    if (newType === documentType) return;

    if (document && htmlContent !== lastSavedContent.current) {
      const confirmed = window.confirm(
        `Het wijzigen van het documenttype zal de huidige inhoud vervangen. Weet je zeker dat je doorgaat?`
      );
      if (!confirmed) return;
    }

    const newContent = getTemplateForType(newType);
    setDocumentType(newType);
    setHtmlContent(newContent);
    lastSavedContent.current = newContent;
    setHasUnsavedChanges(true);
  }, [documentType, document, htmlContent, getTemplateForType]);

  // Track content changes
  useEffect(() => {
    if (isInitialized && htmlContent && htmlContent !== lastSavedContent.current) {
      setHasUnsavedChanges(true);
    }
  }, [htmlContent, isInitialized]);

  const clearDraftForDocument = useCallback(() => {
    lastSavedContent.current = htmlContent;
    setHasUnsavedChanges(false);
  }, [htmlContent]);

  return {
    // Data
    document,
    loading,
    
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
    isInitialized,
    
    // Operations
    clearDraftForDocument
  };
}
