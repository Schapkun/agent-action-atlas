
import React from 'react';
import { 
  DEFAULT_PLACEHOLDER_VALUES, 
  getStorageKey, 
  DEFAULT_INVOICE_TEMPLATE,
  DocumentTypeUI
} from './htmlDocumentConstants';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { useHtmlDraft } from './useHtmlDraft';

interface UseDocumentStateProps {
  editingDocument?: DocumentTemplate | null;
}

export function useDocumentState({ editingDocument }: UseDocumentStateProps) {
  const { getDraft } = useHtmlDraft();

  const getDraftKey = (docName: string) => `builder_draft_${docName}`;

  // Inladen van HTML (draft heeft altijd voorrang!)
  const loadInitialHtmlContent = () => {
    const draftKey = getDraftKey(editingDocument?.name || '');
    const draft = getDraft(draftKey);
    if (draft) return draft;
    if (editingDocument?.html_content) return editingDocument.html_content;
    return DEFAULT_INVOICE_TEMPLATE;
  };

  // --- HOOFDSTATE ---  
  const [documentName, setDocumentName] = React.useState(editingDocument?.name || '');
  const [documentType, setDocumentType] = React.useState<DocumentTypeUI>('factuur');
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [htmlContent, setHtmlContent] = React.useState(loadInitialHtmlContent());
  const [placeholderValues, setPlaceholderValues] = React.useState<Record<string, string>>(() => {
    const storageKey = getStorageKey(editingDocument?.name ?? "");
    const fromStorage = localStorage.getItem(storageKey);
    if (fromStorage) {
      return { ...DEFAULT_PLACEHOLDER_VALUES, ...JSON.parse(fromStorage) };
    }
    return DEFAULT_PLACEHOLDER_VALUES;
  });

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
    getDraftKey,
    loadInitialHtmlContent
  };
}
