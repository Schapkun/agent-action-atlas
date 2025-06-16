
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { SimpleHtmlDocumentBuilder } from './htmldocument/SimpleHtmlDocumentBuilder';
import { DocumentNameDialog } from './components/DocumentNameDialog';
import { DocumentTemplate, useDocumentTemplates } from '@/hooks/useDocumentTemplates';
import { useToast } from '@/hooks/use-toast';
import { DocumentActions } from './components/DocumentActions';
import { DocumentList } from './components/DocumentList';

const DocumentLayoutContent = () => {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [editingDocumentId, setEditingDocumentId] = useState<string | undefined>(undefined);
  const [duplicatingDocument, setDuplicatingDocument] = useState<DocumentTemplate | null>(null);
  
  const { templates, deleteTemplate, createTemplate, fetchTemplates } = useDocumentTemplates();
  const { toast } = useToast();

  const handleNewDocument = () => {
    console.log('[Settings] Creating new document');
    setEditingDocumentId(undefined);
    setIsBuilderOpen(true);
  };

  const handleEditDocument = (document: DocumentTemplate) => {
    console.log('[Settings] Opening document for editing:', document.name, document.id);
    setEditingDocumentId(document.id);
    setIsBuilderOpen(true);
  };

  const handleBuilderComplete = async (success: boolean) => {
    console.log('[Settings] Builder completed, success:', success);
    
    setIsBuilderOpen(false);
    setEditingDocumentId(undefined);
    
    if (success) {
      await fetchTemplates();
      toast({
        title: "Succes",
        description: "Document is opgeslagen."
      });
    }
  };

  const handleDuplicateDocument = (document: DocumentTemplate) => {
    setDuplicatingDocument(document);
    setIsNameDialogOpen(true);
  };

  const handleDuplicateSave = async (name: string, type: 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun', description: string) => {
    if (duplicatingDocument) {
      try {
        await createTemplate({
          name,
          type,
          description,
          html_content: duplicatingDocument.html_content,
          placeholder_values: duplicatingDocument.placeholder_values,
          is_active: true,
          is_default: false
        });
        
        setDuplicatingDocument(null);
        toast({
          title: "Document gedupliceerd",
          description: `"${name}" is aangemaakt als kopie.`
        });
      } catch (error) {
        console.error('Error duplicating document:', error);
        toast({
          title: "Fout",
          description: "Kon document niet dupliceren",
          variant: "destructive"
        });
      }
    }
  };

  const handleDeleteDocument = async (document: DocumentTemplate) => {
    try {
      await deleteTemplate(document.id);
      if (editingDocumentId === document.id) {
        setEditingDocumentId(undefined);
      }
      toast({
        title: "Document verwijderd",
        description: `"${document.name}" is verwijderd.`
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Fout",
        description: "Kon document niet verwijderen",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Document Templates</h3>
        <p className="text-sm text-muted-foreground">
          Beheer en creëer document templates met HTML editor en A4 preview.
        </p>
      </div>

      <DocumentActions onNewDocument={handleNewDocument} />

      <DocumentList
        documents={templates}
        onEditDocument={handleEditDocument}
        onDuplicateDocument={handleDuplicateDocument}
        onDeleteDocument={handleDeleteDocument}
      />

      {/* Simple HTML Document Builder Dialog */}
      <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 flex flex-col">
          <DialogTitle className="sr-only">Document Builder</DialogTitle>
          <SimpleHtmlDocumentBuilder 
            documentId={editingDocumentId}
            onComplete={handleBuilderComplete}
          />
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
        existingNames={templates.map(d => d.name)}
        initialName={duplicatingDocument ? `${duplicatingDocument.name} (kopie)` : ''}
        initialType={duplicatingDocument?.type || 'factuur'}
        initialDescription={duplicatingDocument?.description || ''}
      />
    </div>
  );
};

export const DocumentLayoutSettings = () => {
  return <DocumentLayoutContent />;
};
