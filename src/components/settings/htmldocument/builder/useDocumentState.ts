
import React from 'react';
import { 
  DEFAULT_PLACEHOLDER_VALUES, 
  DocumentTypeUI
} from './htmlDocumentConstants';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';

interface UseDocumentStateProps {
  editingDocument?: DocumentTemplate | null;
}

export function useDocumentState({ editingDocument }: UseDocumentStateProps) {
  // Simple state management - no localStorage, no drafts
  const [documentName, setDocumentName] = React.useState('');
  const [documentType, setDocumentType] = React.useState<DocumentTypeUI>('factuur');
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [htmlContent, setHtmlContent] = React.useState('');
  const [placeholderValues, setPlaceholderValues] = React.useState<Record<string, string>>(DEFAULT_PLACEHOLDER_VALUES);

  // Store last loaded document ID to prevent unnecessary reloads
  const [lastLoadedDocId, setLastLoadedDocId] = React.useState<string | null>(null);

  // Clear localStorage drafts on mount
  React.useEffect(() => {
    console.log('[useDocumentState] Clearing any existing localStorage drafts...');
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('html_draft_') || key.startsWith('builder_draft_')) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  // Map database type to UI type
  const mapDatabaseTypeToUI = (dbType: string, htmlContent?: string): DocumentTypeUI => {
    console.log('[useDocumentState] Mapping DB type:', dbType);
    
    if (dbType === 'schapkun') return 'schapkun';
    if (dbType === 'factuur') return 'factuur';
    if (dbType === 'contract') return 'contract';
    if (dbType === 'brief') return 'brief';
    
    // For 'custom' type, check HTML content for schapkun
    if (dbType === 'custom' && htmlContent && htmlContent.includes('schapkun')) {
      return 'schapkun';
    }
    
    return dbType as DocumentTypeUI || 'custom';
  };

  // Simple draft key function (kept for compatibility, but not used)
  const getDraftKey = React.useCallback((docName: string) => `builder_draft_${docName}`, []);

  // Initialize state from editing document - ALWAYS from database
  React.useEffect(() => {
    // Only reload if document actually changed
    if (editingDocument?.id === lastLoadedDocId) {
      console.log('[useDocumentState] Same document, skipping reload');
      return;
    }

    if (editingDocument) {
      console.log('[useDocumentState] Loading document from database:', editingDocument.name, editingDocument.id);
      
      setDocumentName(editingDocument.name);
      
      // Map document type correctly
      const newType = mapDatabaseTypeToUI(editingDocument.type, editingDocument.html_content);
      console.log('[useDocumentState] Mapped type:', editingDocument.type, 'to', newType);
      setDocumentType(newType);
      
      // ALWAYS use the HTML content from the database
      const freshHtmlContent = editingDocument.html_content || '';
      setHtmlContent(freshHtmlContent);
      console.log('[useDocumentState] Set HTML content from DB, length:', freshHtmlContent.length);
      
      // Load placeholder values from document or defaults
      setPlaceholderValues(editingDocument.placeholder_values || DEFAULT_PLACEHOLDER_VALUES);
      
      // Reset unsaved changes when loading a fresh document
      setHasUnsavedChanges(false);
      setLastLoadedDocId(editingDocument.id);
      
      console.log('[useDocumentState] Document loaded fresh from database');
    } else {
      // Reset to defaults for new document
      console.log('[useDocumentState] Resetting to defaults for new document');
      setDocumentName('');
      setDocumentType('factuur');
      setHtmlContent('');
      setPlaceholderValues(DEFAULT_PLACEHOLDER_VALUES);
      setHasUnsavedChanges(false);
      setLastLoadedDocId(null);
    }
  }, [editingDocument?.id, editingDocument?.updated_at]);

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
