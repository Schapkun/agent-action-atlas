
import { useState, useCallback, useRef } from 'react';

interface DocumentDraft {
  htmlContent: string;
  placeholderValues: Record<string, string>;
  name: string;
  type: 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun';
  hasChanges: boolean;
}

export const useDraftManager = () => {
  const drafts = useRef<Map<string, DocumentDraft>>(new Map());

  const saveDraft = useCallback((documentId: string | undefined, draft: DocumentDraft) => {
    const key = documentId || 'new-document';
    drafts.current.set(key, { ...draft });
    console.log('[DraftManager] Saved draft for:', key, draft.hasChanges);
  }, []);

  const getDraft = useCallback((documentId: string | undefined): DocumentDraft | null => {
    const key = documentId || 'new-document';
    const draft = drafts.current.get(key);
    console.log('[DraftManager] Retrieved draft for:', key, draft?.hasChanges);
    return draft || null;
  }, []);

  const clearDraft = useCallback((documentId: string | undefined) => {
    const key = documentId || 'new-document';
    drafts.current.delete(key);
    console.log('[DraftManager] Cleared draft for:', key);
  }, []);

  const hasDraft = useCallback((documentId: string | undefined): boolean => {
    const key = documentId || 'new-document';
    return drafts.current.has(key);
  }, []);

  return {
    saveDraft,
    getDraft,
    clearDraft,
    hasDraft
  };
};
