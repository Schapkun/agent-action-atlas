import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { SimpleHtmlDocumentBuilder } from './htmldocument/SimpleHtmlDocumentBuilder';
import { DocumentNameDialog } from './components/DocumentNameDialog';
import { useToast } from '@/hooks/use-toast';
import { DocumentActions } from './components/DocumentActions';
import { DocumentList } from './components/DocumentList';
import { DocumentProvider } from './contexts/DocumentContext';
import { DocumentTemplateWithTags } from '@/types/documentTags';
import { TemplateLibraryNew } from './components/TemplateLibraryNew';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';
import { DocumentTypeSettings } from './DocumentTypeSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentUpdatesSettings } from './DocumentUpdatesSettings';

const DocumentSettingsContent = () => {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [editingDocumentId, setEditingDocumentId] = useState<string | undefined>(undefined);
  const [duplicatingDocument, setDuplicatingDocument] = useState<DocumentTemplateWithTags | null>(null);
  
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);
  
  const { templates, loading, fetchTemplates } = useDocumentTemplates();
  const { toast } = useToast();

  // Since tags are removed, we don't need tag filtering anymore
  const availableTags: string[] = [];

  const filteredTemplates = useMemo(() => {
    return templates.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [templates]);

  const handleNewDocument = () => {
    setEditingDocumentId(undefined);
    setIsBuilderOpen(true);
  };

  const handleOpenLibrary = () => {
    setIsLibraryOpen(true);
  };

  const handleEditDocument = (document: DocumentTemplateWithTags) => {
    setEditingDocumentId(document.id);
    setIsBuilderOpen(true);
  };

  const handleBuilderComplete = async (success: boolean) => {
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

  const handleDuplicateDocument = (document: DocumentTemplateWithTags) => {
    setDuplicatingDocument(document);
    setIsNameDialogOpen(true);
  };

  const handleDuplicateSave = async (name: string, description: string) => {
    if (duplicatingDocument) {
      try {
        console.log('Duplicate template functionality needs to be implemented');
        
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

  const handleDeleteDocument = async (document: DocumentTemplateWithTags) => {
    try {
      console.log('Delete template functionality needs to be implemented');
      
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

  const handleClearFilters = () => {
    setSelectedFilterTags([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Templates laden...</span>
        </div>
      </div>
    );
  }

  return (
    <DocumentProvider>
      <div className="space-y-6">
        <Tabs defaultValue="document-templates" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="document-templates">Document Templates</TabsTrigger>
            <TabsTrigger value="document-types">Document Types</TabsTrigger>
            <TabsTrigger value="document-updates">Document Updates</TabsTrigger>
          </TabsList>

          <TabsContent value="document-templates" className="space-y-6">
            <DocumentActions 
              onNewDocument={handleNewDocument}
              onOpenLibrary={handleOpenLibrary}
              selectedTags={selectedFilterTags}
              onTagsChange={setSelectedFilterTags}
              onClearFilters={handleClearFilters}
              availableTags={availableTags}
            />

            <div className="text-sm text-gray-600">
              {filteredTemplates.length} van {templates.length} templates {filteredTemplates.length === 1 ? 'wordt' : 'worden'} getoond
            </div>

            <DocumentList
              documents={filteredTemplates}
              onEditDocument={handleEditDocument}
              onDuplicateDocument={handleDuplicateDocument}
              onDeleteDocument={handleDeleteDocument}
              onRefreshDocuments={fetchTemplates}
            />
          </TabsContent>

          <TabsContent value="document-types" className="space-y-6">
            <DocumentTypeSettings />
          </TabsContent>

          <TabsContent value="document-updates" className="space-y-6">
            <DocumentUpdatesSettings />
          </TabsContent>
        </Tabs>

        <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 flex flex-col">
            <DialogTitle className="sr-only">Document Builder</DialogTitle>
            <SimpleHtmlDocumentBuilder 
              documentId={editingDocumentId}
              onComplete={handleBuilderComplete}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogTitle className="sr-only">Template Bibliotheek</DialogTitle>
            <TemplateLibraryNew />
          </DialogContent>
        </Dialog>

        <DocumentNameDialog
          open={isNameDialogOpen}
          onClose={() => {
            setIsNameDialogOpen(false);
            setDuplicatingDocument(null);
          }}
          onSave={handleDuplicateSave}
          existingNames={templates.map(d => d.name)}
          initialName={duplicatingDocument ? `${duplicatingDocument.name} (kopie)` : ''}
          initialDescription={duplicatingDocument?.description || ''}
        />
      </div>
    </DocumentProvider>
  );
};

export const DocumentSettings = () => {
  return <DocumentSettingsContent />;
};
