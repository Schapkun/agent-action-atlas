import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Plus, Edit, Copy, Trash2 } from 'lucide-react';
import { HTMLDocumentBuilder } from './htmldocument/HTMLDocumentBuilder';
import { DialogHeader } from './components/DialogHeader';
import { DialogFooter } from './components/DialogFooter';
import { DocumentNameDialog } from './components/DocumentNameDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { DocumentProvider, useDocumentContext } from './contexts/DocumentContext';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { useToast } from '@/hooks/use-toast';

const getTypeColor = (type: string) => {
  switch (type) {
    case 'legal':
    case 'contract':
      return 'bg-blue-100 text-blue-800';
    case 'factuur':
      return 'bg-green-100 text-green-800';
    case 'brief':
      return 'bg-purple-100 text-purple-800';
    case 'custom':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const DocumentLayoutContent = () => {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DocumentTemplate | null>(null);
  const [duplicatingDocument, setDuplicatingDocument] = useState<DocumentTemplate | null>(null);
  
  const { documents, deleteDocument, duplicateDocument } = useDocumentContext();
  const { toast } = useToast();

  const handleNewDocument = () => {
    setEditingDocument(null);
    setIsBuilderOpen(true);
  };

  const handleEditDocument = (document: DocumentTemplate) => {
    setEditingDocument(document);
    setIsBuilderOpen(true);
  };

  // <<< Belangrijk: Nu altijd de nieuwste versie van het document gebruiken (bijv. updated_at/databank object)
  const handleDocumentSaved = (document: DocumentTemplate) => {
    if (!document) {
      setEditingDocument(null);
      setIsBuilderOpen(false);
      return;
    }
    setEditingDocument(document); // Save latest from Supabase!
    setIsBuilderOpen(false);
    toast({
      title: "Succes",
      description: `Document "${document.name}" is opgeslagen.`
    });
    console.log('[Settings] Document opgeslagen + gezet als editing:', document.name, document.updated_at, document.id);
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

      <div className="flex items-center gap-4">
        <Button onClick={handleNewDocument} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nieuw Document Template
        </Button>
      </div>

      {/* Documents List */}
      <div className="rounded-lg border">
        {documents.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Geen templates gevonden</p>
            <p className="text-sm">Klik op "Nieuw Document Template" om te beginnen</p>
          </div>
        ) : (
          <div className="divide-y">
            {documents.map((document) => (
              <div key={document.id} className="p-4 hover:bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">{document.name}</span>
                      <Badge variant="outline" className={`text-xs ${getTypeColor(document.type)}`}>
                        {document.type}
                      </Badge>
                      {document.is_default && (
                        <Badge variant="secondary" className="text-xs">Standaard</Badge>
                      )}
                    </div>
                    {document.description && (
                      <p className="text-sm text-muted-foreground mb-1">{document.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Laatst bewerkt: {new Date(document.updated_at).toLocaleDateString('nl-NL')} om {new Date(document.updated_at).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditDocument(document)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicateDocument(document)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Document verwijderen</AlertDialogTitle>
                          <AlertDialogDescription>
                            Weet je zeker dat je "{document.name}" wilt verwijderen? 
                            Deze actie kan niet ongedaan worden gemaakt.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuleren</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteDocument(document)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Verwijderen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
