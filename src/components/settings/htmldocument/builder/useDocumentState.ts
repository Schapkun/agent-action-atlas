
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

  // Store last loaded document ID to prevent unnecessary reloads
  const [lastLoadedDocId, setLastLoadedDocId] = React.useState<string | null>(null);

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

  // Clear draft for current document when switching
  const clearCurrentDraft = React.useCallback(() => {
    if (documentName) {
      const draftKey = getDraftKey(documentName);
      localStorage.removeItem(draftKey);
      console.log('[useDocumentState] Cleared draft for:', documentName);
    }
  }, [documentName, getDraftKey]);

  // Initialize state from editing document - this runs whenever editingDocument changes
  React.useEffect(() => {
    // Only reload if document actually changed
    if (editingDocument?.id === lastLoadedDocId) {
      console.log('[useDocumentState] Same document, skipping reload');
      return;
    }

    if (editingDocument) {
      console.log('[useDocumentState] Loading fresh document from database:', editingDocument.name, editingDocument.id);
      
      // Clear any existing draft for previous document
      clearCurrentDraft();
      
      setDocumentName(editingDocument.name);
      
      // Fixed: Determine document type correctly
      const newType = mapDatabaseTypeToUI(editingDocument.type, editingDocument.html_content);
      console.log('[useDocumentState] Mapped type from DB:', editingDocument.type, 'to UI:', newType);
      setDocumentType(newType);
      
      // ALWAYS use the HTML content from the database, never from localStorage
      const freshHtmlContent = editingDocument.html_content || '';
      setHtmlContent(freshHtmlContent);
      console.log('[useDocumentState] Set HTML content from DB, length:', freshHtmlContent.length);
      
      // Load placeholder values from document or defaults
      setPlaceholderValues(editingDocument.placeholder_values || DEFAULT_PLACEHOLDER_VALUES);
      
      // Reset unsaved changes when loading a fresh document
      setHasUnsavedChanges(false);
      setLastLoadedDocId(editingDocument.id);
      
      console.log('[useDocumentState] Document loaded fresh from database, no drafts used');
    } else {
      // Reset to defaults for new document
      console.log('[useDocumentState] Resetting to defaults for new document');
      clearCurrentDraft();
      setDocumentName('');
      setDocumentType('factuur');
      setHtmlContent('');
      setPlaceholderValues(DEFAULT_PLACEHOLDER_VALUES);
      setHasUnsavedChanges(false);
      setLastLoadedDocId(null);
    }
  }, [editingDocument?.id, editingDocument?.updated_at, clearCurrentDraft, lastLoadedDocId]); 

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
