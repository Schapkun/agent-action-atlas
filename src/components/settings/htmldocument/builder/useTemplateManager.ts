
import { useCallback, useRef, useEffect } from 'react';
import { 
  DEFAULT_INVOICE_TEMPLATE,
  DocumentTypeUI,
  schapkunTemplate
} from './htmlDocumentConstants';

interface UseTemplateManagerProps {
  documentType: DocumentTypeUI;
  setHtmlContent: (content: string) => void;
  setHasUnsavedChanges: (value: boolean) => void;
}

export function useTemplateManager({
  documentType,
  setHtmlContent,
  setHasUnsavedChanges
}: UseTemplateManagerProps) {
  const previousDocumentType = useRef<DocumentTypeUI | null>(null);
  const lastSavedContent = useRef<string>('');

  // Get template content based on type
  const getTemplateForType = useCallback((type: DocumentTypeUI): string => {
    console.log('[Template Manager] Getting template for type:', type);
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

  const switchToTemplate = useCallback((type: DocumentTypeUI) => {
    console.log('[Template Manager] Switching to template:', type);
    const newContent = getTemplateForType(type);
    setHtmlContent(newContent);
    lastSavedContent.current = newContent;
    setHasUnsavedChanges(true);
  }, [getTemplateForType, setHtmlContent, setHasUnsavedChanges]);

  // Handle document type changes (template switching)
  useEffect(() => {
    const hasTypeChanged = previousDocumentType.current !== null && 
                          previousDocumentType.current !== documentType;
    
    console.log('[Template Manager] Type change check:', {
      previousType: previousDocumentType.current,
      currentType: documentType,
      hasTypeChanged
    });

    if (hasTypeChanged) {
      console.log('[Template Manager] *** TEMPLATE TYPE CHANGED ***:', previousDocumentType.current, '->', documentType);
      switchToTemplate(documentType);
    }
    
    previousDocumentType.current = documentType;
  }, [documentType, switchToTemplate]);

  const updateLastSavedContent = useCallback((content: string) => {
    lastSavedContent.current = content;
  }, []);

  return {
    getTemplateForType,
    switchToTemplate,
    updateLastSavedContent,
    lastSavedContent: lastSavedContent.current
  };
}
