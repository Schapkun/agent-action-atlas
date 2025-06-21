
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDocumentTypes, DocumentType } from '@/hooks/useDocumentTypes';
import { DocumentTypeActions } from './components/DocumentTypeActions';
import { DocumentTypeList } from './components/DocumentTypeList';
import { DocumentTypeDialog } from './components/DocumentTypeDialog';
import { Loader2 } from 'lucide-react';

export const DocumentSettings = () => {
  const { toast } = useToast();
  const { documentTypes, loading: documentTypesLoading, createDocumentType, updateDocumentType, deleteDocumentType } = useDocumentTypes();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDocumentType, setEditingDocumentType] = useState<DocumentType | undefined>();
  const [baseDocumentType, setBaseDocumentType] = useState<DocumentType | undefined>();

  const handleNewDocumentType = () => {
    setEditingDocumentType(undefined);
    setBaseDocumentType(undefined);
    setIsDialogOpen(true);
  };

  const handleEditDocumentType = (documentType: DocumentType, baseType?: DocumentType) => {
    setEditingDocumentType(documentType);
    setBaseDocumentType(baseType);
    setIsDialogOpen(true);
  };

  const handleDeleteDocumentType = async (documentType: DocumentType) => {
    if (window.confirm(`Weet je zeker dat je "${documentType.label}" wilt verwijderen?`)) {
      console.log('[DocumentSettings] Attempting to delete document type:', documentType.id);
      
      const success = await deleteDocumentType(documentType.id);
      
      if (success) {
        toast({
          title: "Document type verwijderd",
          description: `"${documentType.label}" is succesvol verwijderd.`
        });
      } else {
        toast({
          title: "Fout bij verwijderen",
          description: "Kon document type niet verwijderen. Probeer het opnieuw.",
          variant: "destructive"
        });
      }
    }
  };

  const handleSaveDocumentType = async (name: string, label: string, templateId?: string) => {
    if (editingDocumentType) {
      const success = await updateDocumentType(editingDocumentType.id, name, label, templateId);
      if (success) {
        toast({
          title: "Document type bijgewerkt",
          description: `"${label}" is bijgewerkt.`
        });
        return true;
      }
    } else {
      const success = await createDocumentType(name, label, templateId);
      if (success) {
        toast({
          title: "Document type aangemaakt",
          description: `"${label}" is aangemaakt.`
        });
        return true;
      }
    }
    
    toast({
      title: "Fout",
      description: "Kon document type niet opslaan. Probeer het opnieuw.",
      variant: "destructive"
    });
    return false;
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDocumentType(undefined);
    setBaseDocumentType(undefined);
  };

  if (documentTypesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Document types laden...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Document Types</h3>
        <p className="text-sm text-muted-foreground">
          Beheer de verschillende document types en hun standaard templates.
        </p>
      </div>

      <DocumentTypeActions onNewDocumentType={handleNewDocumentType} />

      <div className="text-sm text-gray-600">
        {documentTypes.length} document {documentTypes.length === 1 ? 'type' : 'types'} gevonden
      </div>

      <DocumentTypeList
        documentTypes={documentTypes}
        onEditDocumentType={handleEditDocumentType}
        onDeleteDocumentType={handleDeleteDocumentType}
      />

      <DocumentTypeDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveDocumentType}
        documentType={editingDocumentType}
        baseDocumentType={baseDocumentType}
        existingNames={documentTypes.map(dt => dt.name)}
      />
    </div>
  );
};
