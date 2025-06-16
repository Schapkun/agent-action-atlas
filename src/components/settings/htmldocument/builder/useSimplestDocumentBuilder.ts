import { useState, useEffect, useCallback } from 'react';
import { DocumentTemplate, useDocumentTemplates } from '@/hooks/useDocumentTemplates';
import { supabase } from '@/integrations/supabase/client';
import { 
  DocumentTypeUI,
  DEFAULT_INVOICE_TEMPLATE,
  DEFAULT_PLACEHOLDER_VALUES,
  DOCUMENT_TYPE_OPTIONS,
  PLACEHOLDER_FIELDS,
  schapkunTemplate
} from './htmlDocumentConstants';

interface UseSimplestDocumentBuilderProps {
  documentId?: string;
  onComplete?: (success: boolean) => void;
}

// Helper function to safely parse placeholder values from database
const parsePlaceholderValues = (dbValues: any): Record<string, string> => {
  if (!dbValues || typeof dbValues !== 'object' || Array.isArray(dbValues)) {
    return {};
  }
  
  // Ensure all values are strings
  const result: Record<string, string> = {};
  Object.keys(dbValues).forEach(key => {
    const value = dbValues[key];
    result[key] = typeof value === 'string' ? value : String(value || '');
  });
  
  return result;
};

export function useSimplestDocumentBuilder({ 
  documentId, 
  onComplete 
}: UseSimplestDocumentBuilderProps) {
  // Single state object to prevent race conditions
  const [state, setState] = useState({
    // Document data
    document: null as DocumentTemplate | null,
    loading: true,
    error: null as string | null,
    
    // Form data
    htmlContent: '',
    documentName: '',
    documentType: 'factuur' as DocumentTypeUI,
    placeholderValues: { ...DEFAULT_PLACEHOLDER_VALUES } as Record<string, string>,
    
    // UI state
    hasUnsavedChanges: false,
    isSaving: false,
    isPreviewOpen: false,
    
    // Control
    initialized: false
  });

  const { createTemplate, updateTemplate } = useDocumentTemplates();

  // Get template for type
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

  // Initialize document
  useEffect(() => {
    let cancelled = false;

    const initializeDocument = async () => {
      try {
        if (documentId) {
          // Load existing document
          const { data, error } = await supabase
            .from('document_templates')
            .select('*')
            .eq('id', documentId)
            .eq('is_active', true)
            .single();

          if (cancelled) return;

          if (error || !data) {
            setState(prev => ({ 
              ...prev, 
              loading: false, 
              error: 'Document niet gevonden',
              initialized: true 
            }));
            return;
          }

          const doc: DocumentTemplate = {
            ...data,
            placeholder_values: parsePlaceholderValues(data.placeholder_values),
            labels: [] // Add empty labels for compatibility
          };

          // Use default type since we no longer store type
          const content = data.html_content || getTemplateForType('factuur');
          const dbPlaceholders = parsePlaceholderValues(data.placeholder_values);
          const placeholders = { ...DEFAULT_PLACEHOLDER_VALUES, ...dbPlaceholders };

          setState(prev => ({
            ...prev,
            document: doc,
            htmlContent: content,
            documentName: data.name,
            documentType: 'factuur', // Default type
            placeholderValues: placeholders,
            loading: false,
            error: null,
            initialized: true,
            hasUnsavedChanges: false
          }));
        } else {
          // New document
          if (cancelled) return;
          
          const content = getTemplateForType('factuur');
          setState(prev => ({
            ...prev,
            htmlContent: content,
            documentName: 'Nieuw Document',
            documentType: 'factuur',
            placeholderValues: { ...DEFAULT_PLACEHOLDER_VALUES },
            loading: false,
            error: null,
            initialized: true,
            hasUnsavedChanges: false
          }));
        }
      } catch (error) {
        if (cancelled) return;
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Onbekende fout',
          initialized: true 
        }));
      }
    };

    initializeDocument();
    return () => { cancelled = true; };
  }, [documentId, getTemplateForType]);

  // Update functions
  const setHtmlContent = useCallback((content: string) => {
    setState(prev => ({ 
      ...prev, 
      htmlContent: content, 
      hasUnsavedChanges: true 
    }));
  }, []);

  const setDocumentName = useCallback((name: string) => {
    setState(prev => ({ 
      ...prev, 
      documentName: name, 
      hasUnsavedChanges: true 
    }));
  }, []);

  const setDocumentType = useCallback((type: DocumentTypeUI) => {
    setState(prev => {
      if (type === prev.documentType) return prev;
      
      if (prev.hasUnsavedChanges) {
        const confirmed = window.confirm(
          'Het wijzigen van het documenttype zal de huidige inhoud vervangen. Weet je zeker dat je doorgaat?'
        );
        if (!confirmed) return prev;
      }

      const newContent = getTemplateForType(type);
      return {
        ...prev,
        documentType: type,
        htmlContent: newContent,
        hasUnsavedChanges: true
      };
    });
  }, [getTemplateForType]);

  const setPlaceholderValues = useCallback((values: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => {
    setState(prev => ({
      ...prev,
      placeholderValues: typeof values === 'function' ? values(prev.placeholderValues) : values,
      hasUnsavedChanges: true
    }));
  }, []);

  const setIsPreviewOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, isPreviewOpen: open }));
  }, []);

  // Save function
  const handleSave = useCallback(async () => {
    if (!state.documentName.trim()) {
      alert('Voer een documentnaam in');
      return;
    }

    setState(prev => ({ ...prev, isSaving: true }));

    try {
      // Always use 'document' as default type since we're moving away from types
      const documentData = {
        name: state.documentName,
        html_content: state.htmlContent,
        description: `Document template`,
        placeholder_values: state.placeholderValues,
        is_default: false,
        is_active: true
      };

      if (state.document) {
        // Update existing
        await updateTemplate(state.document.id, documentData);
      } else {
        // Create new
        await createTemplate(documentData);
      }

      setState(prev => ({ 
        ...prev, 
        hasUnsavedChanges: false, 
        isSaving: false 
      }));
      
      onComplete?.(true);
    } catch (error) {
      console.error('Save failed:', error);
      alert('Fout bij opslaan: ' + (error as Error).message);
      setState(prev => ({ ...prev, isSaving: false }));
    }
  }, [state, updateTemplate, createTemplate, onComplete]);

  const handleCancel = useCallback(() => {
    if (state.hasUnsavedChanges) {
      const confirmed = window.confirm('Er zijn niet-opgeslagen wijzigingen. Weet je zeker dat je wilt annuleren?');
      if (!confirmed) return;
    }
    onComplete?.(false);
  }, [state.hasUnsavedChanges, onComplete]);

  return {
    // Data
    document: state.document,
    loading: state.loading,
    error: state.error,
    initialized: state.initialized,
    
    // Form state
    htmlContent: state.htmlContent,
    setHtmlContent,
    documentName: state.documentName,
    setDocumentName,
    documentType: state.documentType,
    setDocumentType,
    placeholderValues: state.placeholderValues,
    setPlaceholderValues,
    
    // UI state
    hasUnsavedChanges: state.hasUnsavedChanges,
    isSaving: state.isSaving,
    isPreviewOpen: state.isPreviewOpen,
    setIsPreviewOpen,
    
    // Actions
    handleSave,
    handleCancel,
    
    // Constants
    DOCUMENT_TYPE_OPTIONS,
    PLACEHOLDER_FIELDS
  };
}
