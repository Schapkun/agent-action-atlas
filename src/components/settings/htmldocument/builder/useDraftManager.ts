
import { useCallback } from 'react';
import { useHtmlDraft } from './useHtmlDraft';

interface UseDraftManagerProps {
  documentName: string;
  getDraftKey: (name: string) => string;
}

export function useDraftManager({ documentName, getDraftKey }: UseDraftManagerProps) {
  const { saveDraft, getDraft, clearDraft } = useHtmlDraft();

  const saveDraftForDocument = useCallback((content: string) => {
    if (documentName && content) {
      console.log('[Draft Manager] Saving draft for:', documentName);
      const draftKey = getDraftKey(documentName);
      saveDraft(draftKey, content);
    }
  }, [documentName, getDraftKey, saveDraft]);

  const getDraftForDocument = useCallback((): string | null => {
    if (!documentName) return null;
    const draftKey = getDraftKey(documentName);
    return getDraft(draftKey);
  }, [documentName, getDraftKey, getDraft]);

  const clearDraftForDocument = useCallback(() => {
    if (documentName) {
      const draftKey = getDraftKey(documentName);
      clearDraft(draftKey);
      console.log('[Draft Manager] Cleared draft for:', documentName);
    }
  }, [documentName, getDraftKey, clearDraft]);

  return {
    saveDraftForDocument,
    getDraftForDocument,
    clearDraftForDocument
  };
}
