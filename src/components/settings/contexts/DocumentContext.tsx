import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useDocumentTemplates, DocumentTemplate } from '@/hooks/useDocumentTemplates';

interface DocumentContextType {
  templates: DocumentTemplate[];
  documents: DocumentTemplate[]; // Alias for templates for backward compatibility
  loading: boolean;
  saveDocument: (documentData: Partial<DocumentTemplate>) => Promise<DocumentTemplate>;
  updateDocument: (id: string, updates: Partial<DocumentTemplate>) => Promise<DocumentTemplate>;
  deleteDocument: (id: string) => Promise<void>;
  duplicateDocument: (id: string, newName: string) => Promise<DocumentTemplate>;
  refreshTemplates: () => Promise<void>;
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

  // Sla direct op in de templates lijst na save.
  const saveDocument = async (documentData: Partial<DocumentTemplate>): Promise<DocumentTemplate> => {
    const result = await createTemplate(documentData);
    // Direct updaten
    // Note: in de lib wordt setTemplates aangeroepen, dus de lijst is meteen vers
    return result as DocumentTemplate;
  };

  const updateDocument = async (id: string, updates: Partial<DocumentTemplate>): Promise<DocumentTemplate> => {
    const result = await updateTemplate(id, updates);
    // Direct updaten in array door hook
    return result as DocumentTemplate;
  };

  const deleteDocument = async (id: string) => {
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
    // Type cast the Supabase result to our DocumentTemplate interface
    return result as DocumentTemplate;
  };

  const refreshTemplates = async () => {
    await fetchTemplates();
  };

  const value: DocumentContextType = {
    templates,
    documents: templates, // Alias for backward compatibility
    loading,
    saveDocument,
    updateDocument,
    deleteDocument,
    duplicateDocument,
    refreshTemplates
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
