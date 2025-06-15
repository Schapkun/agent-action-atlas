
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useDraftManager } from './useDraftManager';

export interface SimpleDocumentState {
  id?: string;
  name: string;
  type: 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun';
  htmlContent: string;
  placeholderValues: Record<string, string>;
  layoutId: string;
  isLoading: boolean;
  isSaving: boolean;
  hasChanges: boolean;
  error: string | null;
}

const DEFAULT_TEMPLATE = '<html><body><h1>{{DOCUMENT_TITLE}}</h1><p>Document inhoud...</p></body></html>';
const DEFAULT_PLACEHOLDERS = {
  DOCUMENT_TITLE: 'Nieuw Document',
  COMPANY_NAME: 'Bedrijfsnaam',
  COMPANY_ADDRESS: 'Bedrijfsadres',
  CUSTOMER_NAME: 'Klantnaam',
  DATE: new Date().toLocaleDateString('nl-NL'),
  DESCRIPTION: 'Product/dienst omschrijving',
  QUANTITY: '1',
  UNIT_PRICE: '100.00',
  LINE_TOTAL: '100.00'
};

const TEMPLATES = {
  factuur: `<html><head><style>body{font-family:Arial,sans-serif;margin:40px;}</style></head><body>
    <h1>Factuur</h1>
    <p><strong>Van:</strong> {{COMPANY_NAME}}</p>
    <p>{{COMPANY_ADDRESS}}</p>
    <p><strong>Aan:</strong> {{CUSTOMER_NAME}}</p>
    <p><strong>Datum:</strong> {{DATE}}</p>
    <table border="1" style="width:100%;margin-top:20px;">
      <tr><th>Beschrijving</th><th>Aantal</th><th>Prijs</th><th>Totaal</th></tr>
      <tr><td>{{DESCRIPTION}}</td><td>{{QUANTITY}}</td><td>€{{UNIT_PRICE}}</td><td>€{{LINE_TOTAL}}</td></tr>
    </table>
  </body></html>`,
  contract: `<html><head><style>body{font-family:Arial,sans-serif;margin:40px;}</style></head><body>
    <h1>Contract</h1>
    <p><strong>Tussen:</strong> {{COMPANY_NAME}} en {{CUSTOMER_NAME}}</p>
    <p><strong>Datum:</strong> {{DATE}}</p>
    <p>Contract voorwaarden...</p>
  </body></html>`,
  brief: `<html><head><style>body{font-family:Arial,sans-serif;margin:40px;}</style></head><body>
    <p>{{DATE}}</p>
    <p>Beste {{CUSTOMER_NAME}},</p>
    <p>Brief inhoud...</p>
    <p>Met vriendelijke groet,<br/>{{COMPANY_NAME}}</p>
  </body></html>`,
  schapkun: `<html><head><style>body{font-family:Arial,sans-serif;margin:40px;}</style></head><body>
    <h1>Schapkun Document</h1>
    <p>{{COMPANY_NAME}}</p>
    <p>{{DATE}}</p>
  </body></html>`,
  custom: DEFAULT_TEMPLATE
};

const parseJsonToStringRecord = (value: any): Record<string, string> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ...DEFAULT_PLACEHOLDERS };
  }
  
  const result: Record<string, string> = {};
  for (const [key, val] of Object.entries(value)) {
    if (typeof val === 'string') {
      result[key] = val;
    } else {
      result[key] = String(val || '');
    }
  }
  
  return { ...DEFAULT_PLACEHOLDERS, ...result };
};

export const useSimpleDocumentBuilder = (documentId?: string) => {
  const [state, setState] = useState<SimpleDocumentState>({
    name: 'Nieuw Document',
    type: 'factuur',
    htmlContent: TEMPLATES.factuur,
    placeholderValues: { ...DEFAULT_PLACEHOLDERS },
    layoutId: 'modern-blue',
    isLoading: false,
    isSaving: false,
    hasChanges: false,
    error: null
  });

  const { createTemplate, updateTemplate, templates, loading: templatesLoading } = useDocumentTemplates();
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { saveDraft, saveImmediately, getDraft, clearDraft, hasDraft, setCurrentDocument } = useDraftManager();
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const isInitialized = useRef(false);
  const lastSavedContentRef = useRef<string>('');

  // Set current working document in draft manager
  useEffect(() => {
    setCurrentDocument(documentId, state.layoutId);
  }, [documentId, state.layoutId, setCurrentDocument]);

  // Save current state with layout info
  const saveCurrentStateWithLayout = useCallback(async (currentState: SimpleDocumentState) => {
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
  const debouncedSave = useCallback((currentState: SimpleDocumentState) => {
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

  // Load document with draft awareness
  const loadDocument = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Document niet gevonden');

      const placeholders = parseJsonToStringRecord(data.placeholder_values);
      
      // Check for draft for current layout
      const draft = getDraft(id, state.layoutId);
      
      if (draft && draft.hasChanges) {
        console.log('[SimpleDocumentBuilder] Loading draft for layout:', state.layoutId);
        setState(prev => ({
          ...prev,
          id: data.id,
          name: draft.name,
          type: draft.type,
          htmlContent: draft.htmlContent,
          placeholderValues: draft.placeholderValues,
          isLoading: false,
          hasChanges: draft.hasChanges,
          error: null
        }));
        lastSavedContentRef.current = draft.htmlContent;
      } else {
        const content = data.html_content || TEMPLATES[data.type as keyof typeof TEMPLATES] || DEFAULT_TEMPLATE;
        setState(prev => ({
          ...prev,
          id: data.id,
          name: data.name,
          type: data.type as SimpleDocumentState['type'],
          htmlContent: content,
          placeholderValues: placeholders,
          isLoading: false,
          hasChanges: false,
          error: null
        }));
        lastSavedContentRef.current = content;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Fout bij laden document'
      }));
    }
  }, [getDraft, state.layoutId]);

  // Load template with draft awareness
  const loadTemplate = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) {
      setState(prev => ({ ...prev, error: 'Template niet gevonden' }));
      return;
    }

    const placeholders = parseJsonToStringRecord(template.placeholder_values);
    
    // Check for draft for current layout
    const draft = getDraft(templateId, state.layoutId);
    
    if (draft && draft.hasChanges) {
      console.log('[SimpleDocumentBuilder] Loading template draft for layout:', state.layoutId);
      setState(prev => ({
        ...prev,
        id: template.id,
        name: draft.name,
        type: draft.type,
        htmlContent: draft.htmlContent,
        placeholderValues: draft.placeholderValues,
        hasChanges: draft.hasChanges,
        error: null
      }));
      lastSavedContentRef.current = draft.htmlContent;
    } else {
      const content = template.html_content || TEMPLATES[template.type as keyof typeof TEMPLATES] || DEFAULT_TEMPLATE;
      setState(prev => ({
        ...prev,
        id: template.id,
        name: template.name,
        type: template.type,
        htmlContent: content,
        placeholderValues: placeholders,
        hasChanges: false,
        error: null
      }));
      lastSavedContentRef.current = content;
    }
  }, [templates, getDraft, state.layoutId]);

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
  }, [documentId, templatesLoading, loadDocument, getDraft, state.layoutId]);

  // Update functions with draft management
  const updateName = useCallback((name: string) => {
    setState(prev => {
      const newState = { ...prev, name, hasChanges: true };
      debouncedSave(newState);
      return newState;
    });
  }, [debouncedSave]);

  const updateType = useCallback((type: SimpleDocumentState['type']) => {
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
  }, [debouncedSave]);

  const updateHtmlContent = useCallback((htmlContent: string) => {
    setState(prev => {
      const hasChanges = htmlContent !== lastSavedContentRef.current;
      const newState = { ...prev, htmlContent, hasChanges };
      
      if (hasChanges) {
        debouncedSave(newState);
      }
      
      return newState;
    });
  }, [debouncedSave]);

  const updatePlaceholderValues = useCallback((placeholderValues: Record<string, string>) => {
    setState(prev => {
      const newState = { ...prev, placeholderValues, hasChanges: true };
      debouncedSave(newState);
      return newState;
    });
  }, [debouncedSave]);

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
  }, [state, saveCurrentStateWithLayout, getDraft, documentId]);

  // Save document with draft cleanup
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
  }, [state, createTemplate, updateTemplate, clearDraft, documentId]);

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
    loadTemplate,
    availableTemplates: templates,
    selectedOrganization,
    selectedWorkspace
  };
};
