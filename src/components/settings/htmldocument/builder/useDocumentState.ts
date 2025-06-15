
import React from 'react';
import { 
  DEFAULT_PLACEHOLDER_VALUES, 
  getStorageKey, 
  DocumentTypeUI
} from './htmlDocumentConstants';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';

interface UseDocumentStateProps {
  editingDocument?: DocumentTemplate | null;
}

export function useDocumentState({ editingDocument }: UseDocumentStateProps) {
  const getDraftKey = (docName: string) => `builder_draft_${docName}`;

  // Initialize with simple defaults - HTML content is now managed by useHtmlContentManager
  const [documentName, setDocumentName] = React.useState('');
  const [documentType, setDocumentType] = React.useState<DocumentTypeUI>('factuur');
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  
  // HTML content state - will be managed by useHtmlContentManager
  const [htmlContent, setHtmlContent] = React.useState('');
  
  const [placeholderValues, setPlaceholderValues] = React.useState<Record<string, string>>(DEFAULT_PLACEHOLDER_VALUES);

  // Fixed type mapping function
  const mapDatabaseTypeToUI = (dbType: string, htmlContent?: string): DocumentTypeUI => {
    console.log('[useDocumentState] Mapping DB type:', dbType, 'HTML includes schapkun:', htmlContent?.includes('schapkun'));
    
    // Direct mapping for explicit types
    if (dbType === 'schapkun') {
      return 'schapkun';
    }
    if (dbType === 'factuur') {
      return 'factuur';
    }
    if (dbType === 'contract') {
      return 'contract';
    }
    if (dbType === 'brief') {
      return 'brief';
    }
    
    // For 'custom' type, check HTML content for schapkun
    if (dbType === 'custom' && htmlContent && htmlContent.includes('schapkun')) {
      return 'schapkun';
    }
    
    // Default fallback
    return dbType as DocumentTypeUI || 'custom';
  };

  // Initialize state from editing document - this runs whenever editingDocument changes
  React.useEffect(() => {
    if (editingDocument) {
      console.log('[useDocumentState] Initializing from editing document:', editingDocument.name, editingDocument.id, editingDocument.updated_at);
      
      setDocumentName(editingDocument.name);
      
      // Fixed: Determine document type correctly
      const newType = mapDatabaseTypeToUI(editingDocument.type, editingDocument.html_content);
      console.log('[useDocumentState] Mapped type from DB:', editingDocument.type, 'to UI:', newType);
      setDocumentType(newType);
      
      // Set HTML content
      setHtmlContent(editingDocument.html_content || '');
      console.log('[useDocumentState] Set HTML content, length:', editingDocument.html_content?.length || 0);
      
      // Load placeholder values from document or storage
      const storageKey = getStorageKey(editingDocument.name);
      const fromStorage = localStorage.getItem(storageKey);
      if (fromStorage) {
        setPlaceholderValues({ ...DEFAULT_PLACEHOLDER_VALUES, ...JSON.parse(fromStorage) });
      } else {
        setPlaceholderValues(editingDocument.placeholder_values || DEFAULT_PLACEHOLDER_VALUES);
      }
      
      // Reset unsaved changes when loading a document
      setHasUnsavedChanges(false);
    } else {
      // Reset to defaults for new document
      console.log('[useDocumentState] Resetting to defaults for new document');
      setDocumentName('');
      setDocumentType('factuur');
      setHtmlContent('');
      setPlaceholderValues(DEFAULT_PLACEHOLDER_VALUES);
      setHasUnsavedChanges(false);
    }
  }, [editingDocument?.id, editingDocument?.updated_at]); // Include updated_at to catch changes

  return {
    documentName,
    setDocumentName,
    documentType,
    setDocumentType,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    isSaving,
    setIsSaving,
    isPreviewOpen,
    setIsPreviewOpen,
    htmlContent,
    setHtmlContent,
    placeholderValues,
    setPlaceholderValues,
    getDraftKey
  };
}
