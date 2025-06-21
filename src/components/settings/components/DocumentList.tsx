import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Copy, Trash2, Star, Share, BookOpen, Plus } from 'lucide-react';
import { DocumentTemplateWithLabels } from '@/types/documentTemplateLabels';
import { TemplateLibraryManager } from './TemplateLibraryManager';
import { LabelManagementDialog } from './LabelManagementDialog';

interface DocumentListProps {
  documents: DocumentTemplateWithLabels[];
  onEditDocument: (document: DocumentTemplateWithLabels) => void;
  onDuplicateDocument: (document: DocumentTemplateWithLabels) => void;
  onDeleteDocument: (document: DocumentTemplateWithLabels) => void;
  onRefreshDocuments: () => void;
}

export const DocumentList = ({
  documents,
  onEditDocument,
  onDuplicateDocument,
  onDeleteDocument,
  onRefreshDocuments
}: DocumentListProps) => {
  const [libraryTemplate, setLibraryTemplate] = useState<DocumentTemplateWithLabels | null>(null);
  const [labelManagementTemplate, setLabelManagementTemplate] = useState<DocumentTemplateWithLabels | null>(null);

  const handleShareToLibrary = (document: DocumentTemplateWithLabels) => {
    setLibraryTemplate(document);
  };

  const handleManageLabels = (document: DocumentTemplateWithLabels) => {
    setLabelManagementTemplate(document);
  };

  return (
    <>
      <div className="space-y-4">
        {documents.map((document) => (
          <Card key={document.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-lg truncate">{document.name}</h3>
                      {document.is_default && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                  </div>
                  
                  {/* Labels display */}
                  {document.labels && document.labels.length > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      {document.labels.map((label) => (
                        <Badge
                          key={label.id}
                          style={{ backgroundColor: label.color, color: 'white' }}
                          className="text-xs"
                        >
                          {label.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Tags display (keeping existing functionality) */}
                  {document.tags && document.tags.length > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      {document.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {document.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {document.description}
                    </p>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Laatst bijgewerkt: {new Date(document.updated_at).toLocaleDateString('nl-NL')}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleManageLabels(document)}
                    title="Labels beheren"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditDocument(document)}
                    title="Bewerken"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDuplicateDocument(document)}
                    title="Dupliceren"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShareToLibrary(document)}
                    title="Delen in bibliotheek"
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Verwijderen"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                          onClick={() => onDeleteDocument(document)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Verwijderen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {documents.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Geen templates gevonden</p>
                <p className="text-sm">Maak een nieuw template aan om te beginnen</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <TemplateLibraryManager
        open={!!libraryTemplate}
        onClose={() => setLibraryTemplate(null)}
        currentTemplate={libraryTemplate || undefined}
      />

      {labelManagementTemplate && (
        <LabelManagementDialog
          open={!!labelManagementTemplate}
          onClose={() => setLabelManagementTemplate(null)}
          template={labelManagementTemplate}
          onTemplateUpdate={onRefreshDocuments}
        />
      )}
    </>
  );
};
