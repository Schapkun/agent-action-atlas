
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useDocumentTemplates, DocumentTemplate } from '@/hooks/useDocumentTemplates';

interface DocumentContextType {
  templates: DocumentTemplate[];
  loading: boolean;
  saveDocument: (documentData: Partial<DocumentTemplate>) => Promise<DocumentTemplate>;
  updateDocument: (id: string, updates: Partial<DocumentTemplate>) => Promise<DocumentTemplate>;
  deleteDocument: (id: string) => Promise<void>;
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

  const saveDocument = async (documentData: Partial<DocumentTemplate>) => {
    return await createTemplate(documentData);
  };

  const updateDocument = async (id: string, updates: Partial<DocumentTemplate>) => {
    return await updateTemplate(id, updates);
  };

  const deleteDocument = async (id: string) => {
    await deleteTemplate(id);
  };

  const refreshTemplates = async () => {
    await fetchTemplates();
  };

  const value: DocumentContextType = {
    templates,
    loading,
    saveDocument,
    updateDocument,
    deleteDocument,
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
