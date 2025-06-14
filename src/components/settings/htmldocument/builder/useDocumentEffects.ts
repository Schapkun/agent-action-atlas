
import { useEffect, useRef } from 'react';
import { 
  DEFAULT_PLACEHOLDER_VALUES, 
  getStorageKey, 
  DEFAULT_INVOICE_TEMPLATE,
  DocumentTypeUI,
  schapkunTemplate
} from './htmlDocumentConstants';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { useHtmlDraft } from './useHtmlDraft';

interface UseDocumentEffectsProps {
  editingDocument?: DocumentTemplate | null;
  documentName: string;
  documentType: DocumentTypeUI;
  htmlContent: string;
  setDocumentName: (name: string) => void;
  setDocumentType: (type: DocumentTypeUI) => void;
  setHtmlContent: (content: string) => void;
  setPlaceholderValues: (values: Record<string, string>) => void;
  setHasUnsavedChanges: (value: boolean) => void;
  getDraftKey: (name: string) => string;
}

export function useDocumentEffects({
  editingDocument,
  documentName,
  documentType,
  htmlContent,
  setDocumentName,
  setDocumentType,
  setHtmlContent,
  setPlaceholderValues,
  setHasUnsavedChanges,
  getDraftKey
}: UseDocumentEffectsProps) {
  const { saveDraft, getDraft } = useHtmlDraft();
  const previousEditingDocumentId = useRef<string | null>(null);
  const justSaved = useRef(false);

  // Altijd bij openen of wissel initialiseren
  useEffect(() => {
    const currentId = editingDocument?.id ?? null;
    if (currentId !== previousEditingDocumentId.current) {
      const newName = editingDocument?.name || '';
      setDocumentName(newName);

      let uiType: DocumentTypeUI;
      if (editingDocument?.type === 'custom' && editingDocument?.html_content?.trim() === schapkunTemplate.trim()) {
        uiType = 'schapkun';
      } else {
        uiType = (editingDocument?.type as DocumentTypeUI) || 'factuur';
      }
      setDocumentType(uiType);

      // DRAFT heeft hoogste prio!
      const draftKey = getDraftKey(newName);
      const draft = getDraft(draftKey);
      setHtmlContent(draft || editingDocument?.html_content || DEFAULT_INVOICE_TEMPLATE);

      const storageKey = getStorageKey(newName);
      const fromStorage = localStorage.getItem(storageKey);
      setPlaceholderValues(fromStorage ? { ...DEFAULT_PLACEHOLDER_VALUES, ...JSON.parse(fromStorage) } : DEFAULT_PLACEHOLDER_VALUES);
      setHasUnsavedChanges(false);

      previousEditingDocumentId.current = currentId;
      justSaved.current = false;
    }
  }, [editingDocument?.id, setDocumentName, setDocumentType, setHtmlContent, setPlaceholderValues, setHasUnsavedChanges, getDraftKey, getDraft, editingDocument?.name, editingDocument?.type, editingDocument?.html_content]);

  // Draft bewaren na wijziging HTML (alleen als naam!)
  useEffect(() => {
    if (documentName) {
      saveDraft(getDraftKey(documentName), htmlContent);
    }
  }, [htmlContent, documentName, saveDraft, getDraftKey]);

  // Laad draft bij openen document of naamwijziging
  useEffect(() => {
    const key = getDraftKey(documentName);
    const draft = getDraft(key);
    if (draft && draft !== htmlContent) {
      setHtmlContent(draft);
    }
    const storageKey = getStorageKey(editingDocument?.name ?? "");
    const fromStorage = localStorage.getItem(storageKey);
    setPlaceholderValues(
      fromStorage
        ? { ...DEFAULT_PLACEHOLDER_VALUES, ...JSON.parse(fromStorage) }
        : DEFAULT_PLACEHOLDER_VALUES
    );
    setHasUnsavedChanges(false);
  }, [editingDocument?.id, documentName, getDraft, htmlContent, setHtmlContent, setPlaceholderValues, setHasUnsavedChanges, getDraftKey, editingDocument?.name]);
}
