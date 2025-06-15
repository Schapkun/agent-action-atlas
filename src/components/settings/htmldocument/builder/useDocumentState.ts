
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

  // Initialize state from editing document - this runs whenever editingDocument changes
  React.useEffect(() => {
    if (editingDocument) {
      console.log('[useDocumentState] Initializing from editing document:', editingDocument.name, editingDocument.id, editingDocument.updated_at);
      
      setDocumentName(editingDocument.name);
      
      // Determine document type
      let newType: DocumentTypeUI;
      if (editingDocument.type === 'custom' && editingDocument.html_content?.includes('schapkun')) {
        newType = 'schapkun';
      } else {
        newType = (editingDocument.type as DocumentTypeUI) || 'factuur';
      }
      setDocumentType(newType);
      
      // Set HTML content
      setHtmlContent(editingDocument.html_content || '');
      
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
