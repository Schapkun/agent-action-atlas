
import { useCallback } from 'react';
import { SimpleDocumentState } from './useDocumentState';

export const useSaveOperations = (
  state: SimpleDocumentState,
  setState: React.Dispatch<React.SetStateAction<SimpleDocumentState>>,
  createTemplate: any,
  updateTemplate: any,
  clearDraft: any,
  documentId: string | undefined,
  lastSavedContentRef: React.MutableRefObject<string>
) => {
  const saveDocument = useCallback(async () => {
    if (!state.name.trim()) {
      setState(prev => ({ ...prev, error: 'Documentnaam is verplicht' }));
      return false;
    }

    setState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      const documentData = {
        name: state.name,
        type: state.type,
        html_content: state.htmlContent,
        description: `${state.type} document`,
        placeholder_values: state.placeholderValues,
        is_active: true,
        is_default: false
      };

      if (state.id) {
        await updateTemplate(state.id, documentData);
      } else {
        const newTemplate = await createTemplate(documentData);
        setState(prev => ({ ...prev, id: newTemplate.id }));
      }

      // Clear draft for current layout after successful save
      clearDraft(documentId, state.layoutId);
      lastSavedContentRef.current = state.htmlContent;
      setState(prev => ({ ...prev, isSaving: false, hasChanges: false }));
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Fout bij opslaan'
      }));
      return false;
    }
  }, [state, createTemplate, updateTemplate, clearDraft, documentId, setState]);

  return { saveDocument };
};
