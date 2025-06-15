
import { useState, useCallback, useRef } from 'react';

interface DocumentDraft {
  htmlContent: string;
  placeholderValues: Record<string, string>;
  name: string;
  type: 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun';
  hasChanges: boolean;
  lastSaved: number;
  documentId?: string;
}

interface DraftManagerState {
  currentDocumentId: string | null;
  isAutoSaving: boolean;
  lastOperation: string | null;
}

export const useDraftManager = () => {
  const drafts = useRef<Map<string, DocumentDraft>>(new Map());
  const [state, setState] = useState<DraftManagerState>({
    currentDocumentId: null,
    isAutoSaving: false,
    lastOperation: null
  });
  const maxDrafts = 10;

  // Generate proper draft key
  const getDraftKey = useCallback((documentId: string | undefined): string => {
    return documentId || 'new-document';
  }, []);

  // Immediate save for critical operations (template switching)
  const saveImmediately = useCallback((documentId: string | undefined, draft: DocumentDraft) => {
    const key = getDraftKey(documentId);
    
    console.log('[DraftManager] Immediate save for:', key, {
      name: draft.name,
      hasChanges: draft.hasChanges,
      contentLength: draft.htmlContent.length
    });
    
    // Memory management
    if (drafts.current.size >= maxDrafts && !drafts.current.has(key)) {
      const firstKey = drafts.current.keys().next().value;
      if (firstKey) {
        console.log('[DraftManager] Removing old draft:', firstKey);
        drafts.current.delete(firstKey);
      }
    }
    
    const draftWithTimestamp = {
      ...draft,
      lastSaved: Date.now(),
      documentId
    };
    
    drafts.current.set(key, draftWithTimestamp);
    
    setState(prev => ({
      ...prev,
      currentDocumentId: key,
      lastOperation: 'immediate-save'
    }));
    
    return true;
  }, [getDraftKey]);

  // Standard debounced save
  const saveDraft = useCallback((documentId: string | undefined, draft: DocumentDraft) => {
    const key = getDraftKey(documentId);
    
    console.log('[DraftManager] Auto save for:', key, {
      name: draft.name,
      hasChanges: draft.hasChanges
    });
    
    // Memory management
    if (drafts.current.size >= maxDrafts && !drafts.current.has(key)) {
      const firstKey = drafts.current.keys().next().value;
      if (firstKey) {
        drafts.current.delete(firstKey);
      }
    }
    
    const draftWithTimestamp = {
      ...draft,
      lastSaved: Date.now(),
      documentId
    };
    
    drafts.current.set(key, draftWithTimestamp);
    
    setState(prev => ({
      ...prev,
      lastOperation: 'auto-save'
    }));
  }, [getDraftKey]);

  const getDraft = useCallback((documentId: string | undefined): DocumentDraft | null => {
    const key = getDraftKey(documentId);
    const draft = drafts.current.get(key) || null;
    
    if (draft) {
      console.log('[DraftManager] Retrieved draft for:', key, {
        name: draft.name,
        hasChanges: draft.hasChanges,
        lastSaved: new Date(draft.lastSaved).toLocaleTimeString()
      });
    }
    
    return draft;
  }, [getDraftKey]);

  const clearDraft = useCallback((documentId: string | undefined) => {
    const key = getDraftKey(documentId);
    console.log('[DraftManager] Clearing draft for:', key);
    
    drafts.current.delete(key);
    
    setState(prev => ({
      ...prev,
      lastOperation: 'clear-draft'
    }));
  }, [getDraftKey]);

  const hasDraft = useCallback((documentId: string | undefined): boolean => {
    const key = getDraftKey(documentId);
    return drafts.current.has(key);
  }, [getDraftKey]);

  const clearAllDrafts = useCallback(() => {
    console.log('[DraftManager] Clearing all drafts');
    drafts.current.clear();
    setState(prev => ({
      ...prev,
      currentDocumentId: null,
      lastOperation: 'clear-all'
    }));
  }, []);

  // Get all draft keys for debugging
  const getAllDraftKeys = useCallback((): string[] => {
    return Array.from(drafts.current.keys());
  }, []);

  // Set current working document
  const setCurrentDocument = useCallback((documentId: string | undefined) => {
    const key = getDraftKey(documentId);
    setState(prev => ({
      ...prev,
      currentDocumentId: key
    }));
  }, [getDraftKey]);

  return {
    saveDraft,
    saveImmediately,
    getDraft,
    clearDraft,
    hasDraft,
    clearAllDrafts,
    getAllDraftKeys,
    setCurrentDocument,
    state
  };
};
