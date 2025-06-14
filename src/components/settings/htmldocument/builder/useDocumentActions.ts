
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { DocumentTypeUI } from './htmlDocumentConstants';
import { useSaveOperations } from './useSaveOperations';
import { useExportOperations } from './useExportOperations';
import { usePlaceholderReplacement } from './usePlaceholderReplacement';

interface UseDocumentActionsProps {
  documentName: string;
  documentType: DocumentTypeUI;
  htmlContent: string;
  setHasUnsavedChanges: (value: boolean) => void;
  setIsSaving: (value: boolean) => void;
  setDocumentName: (name: string) => void;
  setDocumentType: (type: DocumentTypeUI) => void;
  setHtmlContent: (content: string) => void;
  editingDocument?: DocumentTemplate | null;
  onDocumentSaved?: (document: DocumentTemplate | null) => void;
  getDraftKey: (name: string) => string;
  placeholderValues: Record<string, string>;
  isSaving: boolean;
  clearDraftForDocument: (documentName: string) => void;
}

export function useDocumentActions(props: UseDocumentActionsProps) {
  const saveOperations = useSaveOperations({
    documentName: props.documentName,
    documentType: props.documentType,
    htmlContent: props.htmlContent,
    setHasUnsavedChanges: props.setHasUnsavedChanges,
    setIsSaving: props.setIsSaving,
    setDocumentName: props.setDocumentName,
    setDocumentType: props.setDocumentType,
    setHtmlContent: props.setHtmlContent,
    editingDocument: props.editingDocument,
    onDocumentSaved: props.onDocumentSaved,
    clearDraftForDocument: props.clearDraftForDocument
  });

  const exportOperations = useExportOperations({
    documentName: props.documentName,
    htmlContent: props.htmlContent
  });

  const placeholderOperations = usePlaceholderReplacement({
    placeholderValues: props.placeholderValues
  });

  return {
    ...saveOperations,
    ...exportOperations,
    ...placeholderOperations
  };
}
