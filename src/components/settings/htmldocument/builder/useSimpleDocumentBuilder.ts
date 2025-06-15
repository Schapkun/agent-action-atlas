
import { useEffect, useCallback, useRef } from 'react';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useDraftManager } from './useDraftManager';
import { useDocumentState } from './useDocumentState';
import { useDocumentOperations } from './useDocumentOperations';
import { useSaveOperations } from './useSaveOperations';
import { TEMPLATES } from './documentConstants';

export type { SimpleDocumentState } from './useDocumentState';

export const useSimpleDocumentBuilder = (documentId?: string) => {
  const { state, setState } = useDocumentState();
  const { createTemplate, updateTemplate, templates, loading: templatesLoading } = useDocumentTemplates();
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { saveDraft, saveImmediately, getDraft, clearDraft, hasDraft, setCurrentDocument } = useDraftManager();
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const isInitialized = useRef(false);
  const lastSavedContentRef = useRef<string>('');

  const { loadDocument, loadTemplate } = useDocumentOperations(state, setState, getDraft, lastSavedContentRef);
  const { saveDocument } = useSaveOperations(state, setState, createTemplate, updateTemplate, clearDraft, documentId, lastSavedContentRef);

  // Set current working document in draft manager
  useEffect(() => {
    setCurrentDocument(documentId, state.layoutId);
  }, [documentId, state.layoutId, setCurrentDocument]);

  // Save current state with layout info
  const saveCurrentStateWithLayout = useCallback(async (currentState: typeof state) => {
    if (currentState.hasChanges && documentId !== undefined) {
      console.log('[SimpleDocumentBuilder] Saving current state for layout:', currentState.layoutId);
      
      const success = saveImmediately(documentId, {
        htmlContent: currentState.htmlContent,
        placeholderValues: currentState.placeholderValues,
        name: currentState.name,
        type: currentState.type,
        hasChanges: currentState.hasChanges,
        lastSaved: Date.now(),
        documentId: documentId,
        layoutId: currentState.layoutId
      }, currentState.layoutId);
      
      if (success) {
        console.log('[SimpleDocumentBuilder] Successfully saved current state');
      }
    }
  }, [saveImmediately, documentId]);

  // Auto-save functionality with draft management
  const debouncedSave = useCallback((currentState: typeof state) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      console.log('[SimpleDocumentBuilder] Auto-save triggered for layout:', currentState.layoutId);
      saveDraft(documentId, {
        htmlContent: currentState.htmlContent,
        placeholderValues: currentState.placeholderValues,
        name: currentState.name,
        type: currentState.type,
        hasChanges: currentState.hasChanges,
        lastSaved: Date.now(),
        documentId: documentId,
        layoutId: currentState.layoutId
      }, currentState.layoutId);
    }, 1000);
  }, [saveDraft, documentId]);

  // Initialize with draft awareness
  useEffect(() => {
    if (isInitialized.current || templatesLoading) return;
    
    isInitialized.current = true;

    if (documentId) {
      loadDocument(documentId);
    } else {
      // Check for draft for new document with current layout
      const draft = getDraft(undefined, state.layoutId);
      if (draft && draft.hasChanges) {
        console.log('[SimpleDocumentBuilder] Loading new document draft for layout:', state.layoutId);
        setState(prev => ({
          ...prev,
          name: draft.name,
          type: draft.type,
          htmlContent: draft.htmlContent,
          placeholderValues: draft.placeholderValues,
          hasChanges: draft.hasChanges,
          error: null
        }));
        lastSavedContentRef.current = draft.htmlContent;
      }
    }
  }, [documentId, templatesLoading, loadDocument, getDraft, state.layoutId, setState]);

  // Update functions with draft management
  const updateName = useCallback((name: string) => {
    setState(prev => {
      const newState = { ...prev, name, hasChanges: true };
      debouncedSave(newState);
      return newState;
    });
  }, [debouncedSave, setState]);

  const updateType = useCallback((type: typeof state.type) => {
    setState(prev => {
      if (type === prev.type) return prev;
      
      const newContent = TEMPLATES[type];
      const newState = {
        ...prev,
        type,
        htmlContent: newContent,
        hasChanges: true
      };
      
      lastSavedContentRef.current = newContent;
      debouncedSave(newState);
      return newState;
    });
  }, [debouncedSave, setState]);

  const updateHtmlContent = useCallback((htmlContent: string) => {
    setState(prev => {
      const hasChanges = htmlContent !== lastSavedContentRef.current;
      const newState = { ...prev, htmlContent, hasChanges };
      
      if (hasChanges) {
        debouncedSave(newState);
      }
      
      return newState;
    });
  }, [debouncedSave, setState]);

  const updatePlaceholderValues = useCallback((placeholderValues: Record<string, string>) => {
    setState(prev => {
      const newState = { ...prev, placeholderValues, hasChanges: true };
      debouncedSave(newState);
      return newState;
    });
  }, [debouncedSave, setState]);

  const updateLayoutId = useCallback(async (layoutId: string) => {
    console.log('[SimpleDocumentBuilder] Switching layout from', state.layoutId, 'to', layoutId);
    
    // Save current state with current layout before switching
    await saveCurrentStateWithLayout(state);
    
    // Check if we have a draft for the new layout
    const layoutDraft = getDraft(documentId, layoutId);
    
    if (layoutDraft && layoutDraft.hasChanges) {
      console.log('[SimpleDocumentBuilder] Restoring draft for layout:', layoutId);
      setState(prev => ({
        ...prev,
        htmlContent: layoutDraft.htmlContent,
        placeholderValues: layoutDraft.placeholderValues,
        name: layoutDraft.name,
        type: layoutDraft.type,
        layoutId: layoutId,
        hasChanges: layoutDraft.hasChanges
      }));
      lastSavedContentRef.current = layoutDraft.htmlContent;
    } else {
      console.log('[SimpleDocumentBuilder] No draft found for layout, keeping current content with new layout');
      setState(prev => ({
        ...prev,
        layoutId: layoutId,
        hasChanges: true // Mark as changed since layout switched
      }));
    }
  }, [state, saveCurrentStateWithLayout, getDraft, documentId, setState]);

  const loadTemplateWrapper = useCallback((templateId: string) => {
    loadTemplate(templateId, templates);
  }, [loadTemplate, templates]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    state,
    updateName,
    updateType,
    updateHtmlContent,
    updatePlaceholderValues,
    updateLayoutId,
    saveDocument,
    loadTemplate: loadTemplateWrapper,
    availableTemplates: templates,
    selectedOrganization,
    selectedWorkspace
  };
};
