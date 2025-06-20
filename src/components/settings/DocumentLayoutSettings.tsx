
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { SimpleHtmlDocumentBuilder } from './htmldocument/SimpleHtmlDocumentBuilder';
import { DocumentNameDialog } from './components/DocumentNameDialog';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';
import { useToast } from '@/hooks/use-toast';
import { DocumentActions } from './components/DocumentActions';
import { DocumentList } from './components/DocumentList';
import { DocumentProvider } from './contexts/DocumentContext';
import { DocumentTemplateWithTags } from '@/types/documentTags';

const DocumentLayoutContent = () => {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [editingDocumentId, setEditingDocumentId] = useState<string | undefined>(undefined);
  const [duplicatingDocument, setDuplicatingDocument] = useState<DocumentTemplateWithTags | null>(null);
  
  // Tag filter states
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);
  
  const { templates, deleteTemplate, createTemplate, fetchTemplates, loading, error } = useDocumentTemplates();
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
        // Sort by creation date (oldest first)
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
  }, [templates, selectedFilterTags]);

  const handleNewDocument = () => {
    setEditingDocumentId(undefined);
    setIsBuilderOpen(true);
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
        await createTemplate({
          name,
          description,
          html_content: duplicatingDocument.html_content,
          placeholder_values: duplicatingDocument.placeholder_values,
          is_active: true,
          is_default: false,
          tags: duplicatingDocument.tags || []
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

  const handleDeleteDocument = async (document: DocumentTemplateWithTags) => {
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
            Beheer en creëer document templates met HTML editor en A4 preview.
          </p>
        </div>

        <DocumentActions 
          onNewDocument={handleNewDocument}
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
          initialDescription={duplicatingDocument?.description || ''}
        />
      </div>
    </DocumentProvider>
  );
};

export const DocumentLayoutSettings = () => {
  return <DocumentLayoutContent />;
};
