
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useDraftManager } from './useDraftManager';

export interface DocumentBuilderState {
  id?: string;
  name: string;
  type: 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun';
  htmlContent: string;
  placeholderValues: Record<string, string>;
  isLoading: boolean;
  isSaving: boolean;
  hasChanges: boolean;
  error: string | null;
  currentWorkingDocumentId?: string;
  lastTemplateLoaded?: string;
}

const DEFAULT_TEMPLATE = '<html><body><h1>{{DOCUMENT_TITLE}}</h1><p>Document inhoud...</p></body></html>';
const DEFAULT_PLACEHOLDERS = {
  DOCUMENT_TITLE: 'Nieuw Document',
  COMPANY_NAME: 'Bedrijfsnaam',
  COMPANY_ADDRESS: 'Bedrijfsadres',
  CUSTOMER_NAME: 'Klantnaam',
  DATE: new Date().toLocaleDateString('nl-NL')
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

export const useNewDocumentBuilder = (documentId?: string) => {
  const [state, setState] = useState<DocumentBuilderState>({
    name: 'Nieuw Document',
    type: 'factuur',
    htmlContent: TEMPLATES.factuur,
    placeholderValues: { ...DEFAULT_PLACEHOLDERS },
    isLoading: false,
    isSaving: false,
    hasChanges: false,
    error: null,
    currentWorkingDocumentId: documentId
  });

  const { createTemplate, updateTemplate, templates, loading: templatesLoading } = useDocumentTemplates();
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { saveDraft, saveImmediately, getDraft, clearDraft, hasDraft, setCurrentDocument } = useDraftManager();
  
  const isInitialized = useRef(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedContentRef = useRef<string>('');

  // Set current working document in draft manager
  useEffect(() => {
    setCurrentDocument(documentId);
    setState(prev => ({ ...prev, currentWorkingDocumentId: documentId }));
  }, [documentId, setCurrentDocument]);

  // Save current state before loading template
  const saveCurrentStateBeforeSwitch = useCallback(async (currentState: DocumentBuilderState) => {
    if (currentState.hasChanges && currentState.currentWorkingDocumentId !== undefined) {
      console.log('[DocumentBuilder] Saving current state before template switch');
      
      const success = saveImmediately(currentState.currentWorkingDocumentId, {
        htmlContent: currentState.htmlContent,
        placeholderValues: currentState.placeholderValues,
        name: currentState.name,
        type: currentState.type,
        hasChanges: currentState.hasChanges
      });
      
      if (success) {
        console.log('[DocumentBuilder] Successfully saved current state');
      }
    }
  }, [saveImmediately]);

  // Load document with proper state management
  const loadDocument = useCallback(async (id: string) => {
    if (state.isLoading) return;
    
    // Save current state first
    await saveCurrentStateBeforeSwitch(state);
    
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
      const draft = getDraft(id);
      
      console.log('[DocumentBuilder] Loading document:', data.name, 'Draft found:', !!draft);
      
      if (draft && draft.hasChanges) {
        setState(prev => ({
          ...prev,
          id: data.id,
          name: draft.name,
          type: draft.type,
          htmlContent: draft.htmlContent,
          placeholderValues: draft.placeholderValues,
          isLoading: false,
          hasChanges: draft.hasChanges,
          error: null,
          currentWorkingDocumentId: id,
          lastTemplateLoaded: id
        }));
        lastSavedContentRef.current = draft.htmlContent;
      } else {
        const content = data.html_content || TEMPLATES[data.type as keyof typeof TEMPLATES] || DEFAULT_TEMPLATE;
        setState(prev => ({
          ...prev,
          id: data.id,
          name: data.name,
          type: data.type as DocumentBuilderState['type'],
          htmlContent: content,
          placeholderValues: placeholders,
          isLoading: false,
          hasChanges: false,
          error: null,
          currentWorkingDocumentId: id,
          lastTemplateLoaded: id
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
  }, [getDraft, state, saveCurrentStateBeforeSwitch]);

  // Load template with immediate save of current state
  const loadTemplate = useCallback(async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) {
      setState(prev => ({ ...prev, error: 'Template niet gevonden' }));
      return;
    }

    console.log('[DocumentBuilder] Loading template:', template.name);
    
    // Check if we have unsaved changes and confirm with user
    if (state.hasChanges && state.currentWorkingDocumentId !== templateId) {
      const confirmed = window.confirm(
        `Je hebt niet-opgeslagen wijzigingen. Wil je deze eerst opslaan voordat je een andere template laadt?`
      );
      
      if (confirmed) {
        // Save current state immediately
        await saveCurrentStateBeforeSwitch(state);
      }
    } else if (state.hasChanges) {
      // Always save current state before switching
      await saveCurrentStateBeforeSwitch(state);
    }

    const placeholders = parseJsonToStringRecord(template.placeholder_values);
    const draft = getDraft(templateId);

    console.log('[DocumentBuilder] Template draft found:', !!draft);

    if (draft && draft.hasChanges) {
      setState(prev => ({
        ...prev,
        id: template.id,
        name: draft.name,
        type: draft.type,
        htmlContent: draft.htmlContent,
        placeholderValues: draft.placeholderValues,
        hasChanges: draft.hasChanges,
        error: null,
        currentWorkingDocumentId: templateId,
        lastTemplateLoaded: templateId
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
        error: null,
        currentWorkingDocumentId: templateId,
        lastTemplateLoaded: templateId
      }));
      lastSavedContentRef.current = content;
    }
  }, [templates, getDraft, state, saveCurrentStateBeforeSwitch]);

  // Initialize
  useEffect(() => {
    if (isInitialized.current || templatesLoading) return;
    
    isInitialized.current = true;

    if (documentId) {
      loadDocument(documentId);
    } else {
      const draft = getDraft(undefined);
      if (draft && draft.hasChanges) {
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
  }, [documentId, templatesLoading, loadDocument, getDraft]);

  // Debounced auto-save
  const debouncedSaveDraft = useCallback((currentState: DocumentBuilderState) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveDraft(currentState.currentWorkingDocumentId, {
        htmlContent: currentState.htmlContent,
        placeholderValues: currentState.placeholderValues,
        name: currentState.name,
        type: currentState.type,
        hasChanges: currentState.hasChanges
      });
    }, 1000);
  }, [saveDraft]);

  // Update functions with proper change tracking
  const updateName = useCallback((name: string) => {
    setState(prev => {
      const newState = { ...prev, name, hasChanges: true };
      debouncedSaveDraft(newState);
      return newState;
    });
  }, [debouncedSaveDraft]);

  const updateType = useCallback((type: DocumentBuilderState['type']) => {
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
      debouncedSaveDraft(newState);
      return newState;
    });
  }, [debouncedSaveDraft]);

  const updateHtmlContent = useCallback((htmlContent: string) => {
    setState(prev => {
      const hasChanges = htmlContent !== lastSavedContentRef.current;
      const newState = { ...prev, htmlContent, hasChanges };
      
      if (hasChanges) {
        debouncedSaveDraft(newState);
      }
      
      return newState;
    });
  }, [debouncedSaveDraft]);

  const updatePlaceholderValues = useCallback((placeholderValues: Record<string, string>) => {
    setState(prev => {
      const newState = { ...prev, placeholderValues, hasChanges: true };
      debouncedSaveDraft(newState);
      return newState;
    });
  }, [debouncedSaveDraft]);

  // Save document
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

      clearDraft(state.currentWorkingDocumentId);
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
  }, [state, createTemplate, updateTemplate, clearDraft]);

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
    saveDocument,
    loadDocument,
    loadTemplate,
    availableTemplates: templates,
    selectedOrganization,
    selectedWorkspace,
    clearDraft: () => clearDraft(state.currentWorkingDocumentId),
    hasDraft: () => hasDraft(state.currentWorkingDocumentId)
  };
};
