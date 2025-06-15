
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
  const maxDrafts = 10; // Limit number of drafts to prevent memory issues

  const saveDraft = useCallback((documentId: string | undefined, draft: DocumentDraft) => {
    const key = documentId || 'new-document';
    
    // Prevent memory leaks by limiting drafts
    if (drafts.current.size >= maxDrafts && !drafts.current.has(key)) {
      // Remove oldest draft
      const firstKey = drafts.current.keys().next().value;
      if (firstKey) {
        drafts.current.delete(firstKey);
      }
    }
    
    drafts.current.set(key, { ...draft });
  }, []);

  const getDraft = useCallback((documentId: string | undefined): DocumentDraft | null => {
    const key = documentId || 'new-document';
    return drafts.current.get(key) || null;
  }, []);

  const clearDraft = useCallback((documentId: string | undefined) => {
    const key = documentId || 'new-document';
    drafts.current.delete(key);
  }, []);

  const hasDraft = useCallback((documentId: string | undefined): boolean => {
    const key = documentId || 'new-document';
    return drafts.current.has(key);
  }, []);

  const clearAllDrafts = useCallback(() => {
    drafts.current.clear();
  }, []);

  return {
    saveDraft,
    getDraft,
    clearDraft,
    hasDraft,
    clearAllDrafts
  };
};
