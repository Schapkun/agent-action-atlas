
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
  const [documentName, setDocumentName] = React.useState(editingDocument?.name || '');
  const [documentType, setDocumentType] = React.useState<DocumentTypeUI>(() => {
    if (editingDocument?.type === 'custom' && editingDocument?.html_content?.includes('schapkun')) {
      return 'schapkun';
    }
    return (editingDocument?.type as DocumentTypeUI) || 'factuur';
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  
  // HTML content state - will be managed by useHtmlContentManager
  const [htmlContent, setHtmlContent] = React.useState('');
  
  const [placeholderValues, setPlaceholderValues] = React.useState<Record<string, string>>(() => {
    const storageKey = getStorageKey(editingDocument?.name ?? "");
    const fromStorage = localStorage.getItem(storageKey);
    if (fromStorage) {
      return { ...DEFAULT_PLACEHOLDER_VALUES, ...JSON.parse(fromStorage) };
    }
    return DEFAULT_PLACEHOLDER_VALUES;
  });

  // Update document name when editing document changes
  React.useEffect(() => {
    if (editingDocument?.name !== documentName) {
      setDocumentName(editingDocument?.name || '');
    }
  }, [editingDocument?.name, documentName]);

  // Update document type when editing document changes
  React.useEffect(() => {
    if (editingDocument) {
      let newType: DocumentTypeUI;
      if (editingDocument.type === 'custom' && editingDocument.html_content?.includes('schapkun')) {
        newType = 'schapkun';
      } else {
        newType = (editingDocument.type as DocumentTypeUI) || 'factuur';
      }
      if (newType !== documentType) {
        setDocumentType(newType);
      }
    }
  }, [editingDocument?.type, editingDocument?.html_content, documentType]);

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
