
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { SimpleHtmlDocumentBuilder } from './htmldocument/SimpleHtmlDocumentBuilder';
import { DocumentNameDialog } from './components/DocumentNameDialog';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';
import { useDocumentTemplateLabels } from '@/hooks/useDocumentTemplateLabels';
import { useToast } from '@/hooks/use-toast';
import { DocumentActions } from './components/DocumentActions';
import { DocumentList } from './components/DocumentList';
import { DocumentProvider } from './contexts/DocumentContext';
import { DocumentTemplateWithLabels } from '@/types/documentLabels';
import { DocumentTemplateLabel } from '@/types/documentLabels';

const DocumentLayoutContent = () => {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [editingDocumentId, setEditingDocumentId] = useState<string | undefined>(undefined);
  const [duplicatingDocument, setDuplicatingDocument] = useState<DocumentTemplateWithLabels | null>(null);
  
  // Filter states
  const [selectedFilterLabels, setSelectedFilterLabels] = useState<DocumentTemplateLabel[]>([]);
  
  const { templates, deleteTemplate, createTemplate, fetchTemplates } = useDocumentTemplates();
  const { labels } = useDocumentTemplateLabels();
  const { toast } = useToast();

  // Filter and sort templates based on selected labels - oldest first
  const filteredTemplates = useMemo(() => {
    return templates
      .filter(template => {
        // Label filter - if any labels are selected, the template must have at least one of them
        if (selectedFilterLabels.length > 0) {
          const templateLabelIds = template.labels?.map(label => label.id) || [];
          const hasMatchingLabel = selectedFilterLabels.some(filterLabel => 
            templateLabelIds.includes(filterLabel.id)
          );
          if (!hasMatchingLabel) {
            return false;
          }
        }
        
        return true;
      })
      .sort((a, b) => {
        // Sort by creation date (oldest first)
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
  }, [templates, selectedFilterLabels]);

  const handleNewDocument = () => {
    console.log('[Settings] Creating new document');
    setEditingDocumentId(undefined);
    setIsBuilderOpen(true);
  };

  const handleEditDocument = (document: DocumentTemplateWithLabels) => {
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

  const handleDuplicateDocument = (document: DocumentTemplateWithLabels) => {
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
          labelIds: duplicatingDocument.labels?.map(label => label.id) || []
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

  const handleDeleteDocument = async (document: DocumentTemplateWithLabels) => {
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
    setSelectedFilterLabels([]);
  };

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
          selectedLabels={selectedFilterLabels}
          onLabelsChange={setSelectedFilterLabels}
          onClearFilters={handleClearFilters}
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
