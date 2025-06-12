
import React, { createContext, useContext, useState, useEffect } from 'react';
import { DocumentTemplate } from '../types/DocumentTemplate';

interface DocumentContextType {
  documents: DocumentTemplate[];
  currentDocument: DocumentTemplate | null;
  saveDocument: (document: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDocument: (id: string, updates: Partial<DocumentTemplate>) => void;
  deleteDocument: (id: string) => void;
  loadDocument: (id: string) => DocumentTemplate | null;
  duplicateDocument: (id: string, newName: string) => void;
  setCurrentDocument: (document: DocumentTemplate | null) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const useDocumentContext = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocumentContext must be used within DocumentProvider');
  }
  return context;
};

export const DocumentProvider = ({ children }: { children: React.ReactNode }) => {
  const [documents, setDocuments] = useState<DocumentTemplate[]>([]);
  const [currentDocument, setCurrentDocument] = useState<DocumentTemplate | null>(null);

  // Load documents from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('html_documents');
    if (stored) {
      try {
        const parsed = JSON.parse(stored).map((doc: any) => ({
          ...doc,
          createdAt: new Date(doc.createdAt),
          updatedAt: new Date(doc.updatedAt),
          lastModified: new Date(doc.lastModified)
        }));
        // Sort alphabetically by name
        parsed.sort((a: DocumentTemplate, b: DocumentTemplate) => a.name.localeCompare(b.name));
        setDocuments(parsed);
      } catch (error) {
        console.error('Error loading documents:', error);
      }
    }
  }, []);

  // Save documents to localStorage whenever documents change
  useEffect(() => {
    if (documents.length > 0) {
      localStorage.setItem('html_documents', JSON.stringify(documents));
    }
  }, [documents]);

  const saveDocument = (documentData: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newDocument: DocumentTemplate = {
      ...documentData,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
      lastModified: now
    };

    setDocuments(prev => {
      const updated = [...prev, newDocument];
      // Sort alphabetically by name
      updated.sort((a, b) => a.name.localeCompare(b.name));
      return updated;
    });

    return newDocument;
  };

  const updateDocument = (id: string, updates: Partial<DocumentTemplate>) => {
    setDocuments(prev => {
      const updated = prev.map(doc => 
        doc.id === id 
          ? { ...doc, ...updates, updatedAt: new Date(), lastModified: new Date() }
          : doc
      );
      // Resort alphabetically by name if name was updated
      if (updates.name) {
        updated.sort((a, b) => a.name.localeCompare(b.name));
      }
      return updated;
    });
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    if (currentDocument?.id === id) {
      setCurrentDocument(null);
    }
  };

  const loadDocument = (id: string): DocumentTemplate | null => {
    return documents.find(doc => doc.id === id) || null;
  };

  const duplicateDocument = (id: string, newName: string) => {
    const original = documents.find(doc => doc.id === id);
    if (original) {
      const now = new Date();
      const duplicate: DocumentTemplate = {
        ...original,
        id: Date.now().toString(),
        name: newName,
        createdAt: now,
        updatedAt: now,
        lastModified: now,
        isDefault: false
      };

      setDocuments(prev => {
        const updated = [...prev, duplicate];
        updated.sort((a, b) => a.name.localeCompare(b.name));
        return updated;
      });
    }
  };

  return (
    <DocumentContext.Provider value={{
      documents,
      currentDocument,
      saveDocument,
      updateDocument,
      deleteDocument,
      loadDocument,
      duplicateDocument,
      setCurrentDocument
    }}>
      {children}
    </DocumentContext.Provider>
  );
};
