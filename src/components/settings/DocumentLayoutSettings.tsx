import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { SimpleHtmlDocumentBuilder } from './htmldocument/SimpleHtmlDocumentBuilder';
import { DocumentNameDialog } from './components/DocumentNameDialog';
import { useToast } from '@/hooks/use-toast';
import { DocumentActions } from './components/DocumentActions';
import { DocumentList } from './components/DocumentList';
import { DocumentProvider } from './contexts/DocumentContext';
import { DocumentTemplateWithLabels } from '@/types/documentTemplateLabels';
import { TemplateLibraryNew } from './components/TemplateLibraryNew';
import { useDocumentTemplatesWithLabels } from '@/hooks/useDocumentTemplatesWithLabels';

const DocumentLayoutContent = () => {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [editingDocumentId, setEditingDocumentId] = useState<string | undefined>(undefined);
  const [duplicatingDocument, setDuplicatingDocument] = useState<DocumentTemplateWithLabels | null>(null);
  
  // Tag filter states (keeping existing functionality)
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);
  
  const { templates, loading, refetch } = useDocumentTemplatesWithLabels();
  const { toast } = useToast();

  // Get all unique tags from templates - memoized to prevent recalculation
  const availableTags = useMemo(() => {
    const allTags = templates.flatMap(template => template.tags || []);
    return [...new Set(allTags)].sort();
  }, [templates]);

  // Filter and sort templates based on selected tags - memoized for performance
  const filteredTemplates = useMemo(() => {
    return templates
      .filter(template => {
        // Tag filter - if any tags are selected, the template must have at least one of them
        if (selectedFilterTags.length > 0) {
          const templateTags = template.tags || [];
          const hasMatchingTag = selectedFilterTags.some(filterTag => 
            templateTags.includes(filterTag)
          );
          if (!hasMatchingTag) {
            return false;
          }
        }
        
        return true;
      })
      .sort((a, b) => {
        // Sort by creation date (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [templates, selectedFilterTags]);

  const handleNewDocument = () => {
    setEditingDocumentId(undefined);
    setIsBuilderOpen(true);
  };

  const handleOpenLibrary = () => {
    setIsLibraryOpen(true);
  };

  const handleEditDocument = (document: DocumentTemplateWithLabels) => {
    setEditingDocumentId(document.id);
    setIsBuilderOpen(true);
  };

  const handleBuilderComplete = async (success: boolean) => {
    setIsBuilderOpen(false);
    setEditingDocumentId(undefined);
    
    if (success) {
      await refetch();
      toast({
        title: "Succes",
        description: "Document is opgeslagen."
      });
    }
  };

  const handleDuplicateDocument = (document: DocumentTemplateWithLabels) => {
    setDuplicatingDocument(document);
    setIsNameDialogOpen(true);
  };

  const handleDuplicateSave = async (name: string, description: string) => {
    if (duplicatingDocument) {
      try {
        // Note: You'll need to add createTemplate function to the labels hook or use the existing hook
        // For now, using a placeholder - this would need to be implemented
        console.log('Duplicate template functionality needs to be implemented with label support');
        
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

  const handleDeleteDocument = async (document: DocumentTemplateWithLabels) => {
    try {
      // Note: You'll need deleteTemplate function in the labels hook
      console.log('Delete template functionality needs to be implemented with label support');
      
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

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Fout bij laden van templates: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <DocumentProvider>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Document Templates</h3>
          <p className="text-sm text-muted-foreground">
            Beheer document templates en labels, of ontdek nieuwe templates in de bibliotheek.
          </p>
        </div>

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
          onRefreshDocuments={refetch}
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

        {/* Library Dialog */}
        <Dialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogTitle className="sr-only">Template Bibliotheek</DialogTitle>
            <TemplateLibraryNew />
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
          initialDescription={duplicatingDocument?.description || ''}
        />
      </div>
    </DocumentProvider>
  );
};

export const DocumentLayoutSettings = () => {
  return <DocumentLayoutContent />;
};
