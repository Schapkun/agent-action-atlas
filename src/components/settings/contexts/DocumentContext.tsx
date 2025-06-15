
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useDocumentTemplates, DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { supabase } from '@/integrations/supabase/client';

interface DocumentContextType {
  templates: DocumentTemplate[];
  documents: DocumentTemplate[]; // Alias for templates for backward compatibility
  loading: boolean;
  saveDocument: (documentData: Partial<DocumentTemplate>) => Promise<DocumentTemplate>;
  updateDocument: (id: string, updates: Partial<DocumentTemplate>) => Promise<DocumentTemplate>;
  deleteDocument: (id: string) => Promise<void>;
  duplicateDocument: (id: string, newName: string) => Promise<DocumentTemplate>;
  refreshTemplates: () => Promise<void>;
  getLatestDocument: (id: string) => Promise<DocumentTemplate | null>;
  refreshAndWait: () => Promise<void>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

interface DocumentProviderProps {
  children: ReactNode;
}

export const DocumentProvider = ({ children }: DocumentProviderProps) => {
  const {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    fetchTemplates
  } = useDocumentTemplates();

  const getLatestDocument = async (id: string): Promise<DocumentTemplate | null> => {
    console.log('[DocumentContext] Fetching latest document directly from database:', id);
    
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('[DocumentContext] Error fetching latest document:', error);
        return null;
      }

      if (!data) {
        console.log('[DocumentContext] No document found with id:', id);
        return null;
      }

      // Transform the data to ensure proper typing
      const transformedDocument: DocumentTemplate = {
        ...data,
        type: data.type as 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun',
        placeholder_values: data.placeholder_values ? 
          (typeof data.placeholder_values === 'object' && data.placeholder_values !== null ? 
            data.placeholder_values as Record<string, string> : null) : null
      };

      console.log('[DocumentContext] Latest document fetched successfully:', transformedDocument.name, 'updated_at:', transformedDocument.updated_at);
      return transformedDocument;
    } catch (error) {
      console.error('[DocumentContext] Exception while fetching latest document:', error);
      return null;
    }
  };

  const refreshAndWait = async (): Promise<void> => {
    console.log('[DocumentContext] Starting refreshAndWait...');
    
    // Store current template count
    const initialCount = templates.length;
    const initialTimestamp = templates.length > 0 ? templates[0].updated_at : null;
    
    // Trigger refresh
    await fetchTemplates();
    
    // Wait for actual state update by polling
    let attempts = 0;
    const maxAttempts = 20; // 2 seconds max
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if state has actually updated
      const hasCountChanged = templates.length !== initialCount;
      const hasTimestampChanged = templates.length > 0 && templates[0].updated_at !== initialTimestamp;
      
      if (hasCountChanged || hasTimestampChanged) {
        console.log('[DocumentContext] State successfully updated after', (attempts + 1) * 100, 'ms');
        return;
      }
      
      attempts++;
    }
    
    console.log('[DocumentContext] Warning: State may not have updated after refresh');
  };

  const saveDocument = async (documentData: Partial<DocumentTemplate>): Promise<DocumentTemplate> => {
    const result = await createTemplate(documentData);
    console.log('[DocumentContext] Document saved:', result);
    return result as DocumentTemplate;
  };

  const updateDocument = async (id: string, updates: Partial<DocumentTemplate>): Promise<DocumentTemplate> => {
    console.log('[DocumentContext] Updating document:', id, updates);
    const result = await updateTemplate(id, updates);
    console.log('[DocumentContext] Document updated in context:', result);
    return result as DocumentTemplate;
  };

  const deleteDocument = async (id: string) => {
    console.log('[DocumentContext] Deleting document:', id);
    await deleteTemplate(id);
  };

  const duplicateDocument = async (id: string, newName: string): Promise<DocumentTemplate> => {
    const template = templates.find(t => t.id === id);
    if (!template) {
      throw new Error('Template not found');
    }

    const duplicatedData = {
      name: newName,
      type: template.type,
      description: template.description,
      html_content: template.html_content,
      is_default: false,
      is_active: true
    };

    const result = await createTemplate(duplicatedData);
    return result as DocumentTemplate;
  };

  const refreshTemplates = async () => {
    console.log('[DocumentContext] Refreshing templates...');
    await fetchTemplates();
    console.log('[DocumentContext] Templates refreshed, count:', templates.length);
  };

  const value: DocumentContextType = {
    templates,
    documents: templates, // Alias for backward compatibility
    loading,
    saveDocument,
    updateDocument,
    deleteDocument,
    duplicateDocument,
    refreshTemplates,
    getLatestDocument,
    refreshAndWait
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocumentContext = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocumentContext must be used within a DocumentProvider');
  }
  return context;
};
