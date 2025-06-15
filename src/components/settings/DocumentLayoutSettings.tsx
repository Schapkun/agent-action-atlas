
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { HTMLDocumentBuilderV2 } from './htmldocument/HTMLDocumentBuilderV2';
import { DocumentNameDialog } from './components/DocumentNameDialog';
import { DocumentProvider, useDocumentContext } from './contexts/DocumentContext';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { useToast } from '@/hooks/use-toast';
import { DocumentActions } from './components/DocumentActions';
import { DocumentList } from './components/DocumentList';

const DocumentLayoutContent = () => {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [editingDocumentId, setEditingDocumentId] = useState<string | undefined>(undefined);
  const [duplicatingDocument, setDuplicatingDocument] = useState<DocumentTemplate | null>(null);
  
  const { documents, deleteDocument, duplicateDocument, refreshTemplates } = useDocumentContext();
  const { toast } = useToast();

  const handleNewDocument = () => {
    setEditingDocumentId(undefined);
    setIsBuilderOpen(true);
  };

  const handleEditDocument = (document: DocumentTemplate) => {
    console.log('[Settings V2] Opening document for editing:', document.name, document.id);
    setEditingDocumentId(document.id);
    setIsBuilderOpen(true);
  };

  const handleDocumentSaved = async (document: DocumentTemplate | null) => {
    console.log('[Settings V2] Document saved, refreshing context...');
    
    // Refresh the context to update the list
    await refreshTemplates();
    
    // Close the builder
    setEditingDocumentId(undefined);
    setIsBuilderOpen(false);
    
    if (document) {
      toast({
        title: "Succes",
        description: `Document "${document.name}" is opgeslagen.`
      });
    }
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
    if (editingDocumentId === document.id) {
      setEditingDocumentId(undefined);
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
            <HTMLDocumentBuilderV2 
              documentId={editingDocumentId}
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
