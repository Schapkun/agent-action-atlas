
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { parseJsonToStringRecord } from './documentUtils';
import { TEMPLATES, DEFAULT_TEMPLATE } from './documentConstants';
import { SimpleDocumentState } from './useDocumentState';

export const useDocumentOperations = (
  state: SimpleDocumentState,
  setState: React.Dispatch<React.SetStateAction<SimpleDocumentState>>,
  getDraft: (documentId: string | undefined, layoutId?: string) => any,
  lastSavedContentRef: React.MutableRefObject<string>
) => {
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
  }, [getDraft, state.layoutId, setState]);

  const loadTemplate = useCallback((templateId: string, templates: any[]) => {
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
  }, [getDraft, state.layoutId, setState]);

  return { loadDocument, loadTemplate };
};
