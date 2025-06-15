
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { HTMLDocumentBuilder } from './htmldocument/HTMLDocumentBuilder';
import { DocumentNameDialog } from './components/DocumentNameDialog';
import { DocumentProvider, useDocumentContext } from './contexts/DocumentContext';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { useToast } from '@/hooks/use-toast';
import { DocumentActions } from './components/DocumentActions';
import { DocumentList } from './components/DocumentList';

const DocumentLayoutContent = () => {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DocumentTemplate | null>(null);
  const [duplicatingDocument, setDuplicatingDocument] = useState<DocumentTemplate | null>(null);
  
  const { documents, deleteDocument, duplicateDocument, refreshTemplates } = useDocumentContext();
  const { toast } = useToast();

  const handleNewDocument = () => {
    setEditingDocument(null);
    setIsBuilderOpen(true);
  };

  const handleEditDocument = (document: DocumentTemplate) => {
    console.log('[Settings] Opening document for editing:', document.name, document.id);
    setEditingDocument(document);
    setIsBuilderOpen(true);
  };

  const handleDocumentSaved = async (document: DocumentTemplate | null) => {
    if (!document) {
      setEditingDocument(null);
      setIsBuilderOpen(false);
      return;
    }

    console.log('[Settings] Document saved, refreshing templates...');
    
    // Force refresh templates from database
    await refreshTemplates();
    
    // Wait a bit for the refresh to complete
    setTimeout(() => {
      // Find the updated document from the refreshed list
      const updatedDocument = documents.find(d => d.id === document.id);
      console.log('[Settings] Found updated document:', updatedDocument?.name, updatedDocument?.updated_at);
      
      // Update the editing document with the latest version
      setEditingDocument(updatedDocument || document);
      setIsBuilderOpen(false);
      
      toast({
        title: "Succes",
        description: `Document "${document.name}" is opgeslagen.`
      });
    }, 100);
    
    console.log('[Settings] Document opgeslagen + state bijgewerkt:', document.name, document.updated_at, document.id);
  };

  const handleDuplicateDocument = (document: DocumentTemplate) => {
    setDuplicatingDocument(document);
    setIsNameDialogOpen(true);
  };

  const handleDuplicateSave = (name: string, type: 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun', description: string) => {
    if (duplicatingDocument) {
      duplicateDocument(duplicatingDocument.id, name);
      setDuplicatingDocument(null);
      toast({
        title: "Document gedupliceerd",
        description: `"${name}" is aangemaakt als kopie.`
      });
    }
  };

  const handleDeleteDocument = (document: DocumentTemplate) => {
    deleteDocument(document.id);
    // If we're currently editing the deleted document, clear the state
    if (editingDocument?.id === document.id) {
      setEditingDocument(null);
    }
    toast({
      title: "Document verwijderd",
      description: `"${document.name}" is verwijderd.`
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Document Templates</h3>
        <p className="text-sm text-muted-foreground">
          Beheer en creëer document templates voor automatische generatie.
        </p>
      </div>

      <DocumentActions onNewDocument={handleNewDocument} />

      <DocumentList
        documents={documents}
        onEditDocument={handleEditDocument}
        onDuplicateDocument={handleDuplicateDocument}
        onDeleteDocument={handleDeleteDocument}
      />

      {/* HTML Builder Dialog */}
      <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-2.5 flex flex-col">
          <div 
            className="p-2.5 min-h-0 overflow-hidden"
            style={{ height: 'calc(100% - 5px)' }}
          >
            <HTMLDocumentBuilder 
              editingDocument={editingDocument}
              onDocumentSaved={handleDocumentSaved}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Duplicate Name Dialog */}
      <DocumentNameDialog
        open={isNameDialogOpen}
        onClose={() => {
          setIsNameDialogOpen(false);
          setDuplicatingDocument(null);
        }}
        onSave={handleDuplicateSave}
        existingNames={documents.map(d => d.name)}
        initialName={duplicatingDocument ? `${duplicatingDocument.name} (kopie)` : ''}
        initialType={duplicatingDocument?.type || 'factuur'}
        initialDescription={duplicatingDocument?.description || ''}
      />
    </div>
  );
};

export const DocumentLayoutSettings = () => {
  return (
    <DocumentProvider>
      <DocumentLayoutContent />
    </DocumentProvider>
  );
};
