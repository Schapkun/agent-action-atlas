
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';
import { useOrganization } from '@/contexts/OrganizationContext';

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

// Type guard function to safely convert database JSON to Record<string, string>
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
    error: null
  });

  const { createTemplate, updateTemplate, templates } = useDocumentTemplates();
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  // Load document from database
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

      const placeholders = parseJsonToStringRecord(data.placeholder_values);

      setState(prev => ({
        ...prev,
        id: data.id,
        name: data.name,
        type: data.type as DocumentBuilderState['type'],
        htmlContent: data.html_content || TEMPLATES[data.type as keyof typeof TEMPLATES] || DEFAULT_TEMPLATE,
        placeholderValues: placeholders,
        isLoading: false,
        hasChanges: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Fout bij laden document'
      }));
    }
  }, []);

  // Load template from existing templates
  const loadTemplate = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const placeholders = parseJsonToStringRecord(template.placeholder_values);

    setState(prev => ({
      ...prev,
      id: template.id,
      name: template.name,
      type: template.type,
      htmlContent: template.html_content || TEMPLATES[template.type as keyof typeof TEMPLATES] || DEFAULT_TEMPLATE,
      placeholderValues: placeholders,
      hasChanges: false,
      error: null
    }));
  }, [templates]);

  // Initialize document
  useEffect(() => {
    if (documentId) {
      loadDocument(documentId);
    } else {
      // New document
      setState(prev => ({
        ...prev,
        id: undefined,
        name: 'Nieuw Document',
        type: 'factuur',
        htmlContent: TEMPLATES.factuur,
        placeholderValues: { ...DEFAULT_PLACEHOLDERS },
        hasChanges: false
      }));
    }
  }, [documentId, loadDocument]);

  // Update functions
  const updateName = useCallback((name: string) => {
    setState(prev => ({ ...prev, name, hasChanges: true }));
  }, []);

  const updateType = useCallback((type: DocumentBuilderState['type']) => {
    setState(prev => ({
      ...prev,
      type,
      htmlContent: TEMPLATES[type],
      hasChanges: true
    }));
  }, []);

  const updateHtmlContent = useCallback((htmlContent: string) => {
    setState(prev => ({ ...prev, htmlContent, hasChanges: true }));
  }, []);

  const updatePlaceholderValues = useCallback((placeholderValues: Record<string, string>) => {
    setState(prev => ({ ...prev, placeholderValues, hasChanges: true }));
  }, []);

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
        // Update existing
        await updateTemplate(state.id, documentData);
      } else {
        // Create new
        const newTemplate = await createTemplate(documentData);
        setState(prev => ({ ...prev, id: newTemplate.id }));
      }

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
  }, [state.name, state.type, state.htmlContent, state.placeholderValues, state.id, createTemplate, updateTemplate]);

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
    selectedWorkspace
  };
};
