
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Copy, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';

interface DocumentListItemProps {
  document: DocumentTemplate;
  onEdit: (document: DocumentTemplate) => void;
  onDuplicate: (document: DocumentTemplate) => void;
  onDelete: (document: DocumentTemplate) => void;
}

export const DocumentListItem = ({ 
  document, 
  onEdit, 
  onDuplicate, 
  onDelete 
}: DocumentListItemProps) => {
  return (
    <div className="p-4 hover:bg-muted/50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-medium">{document.name}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Laatst bewerkt: {new Date(document.updated_at).toLocaleDateString('nl-NL')} om {new Date(document.updated_at).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
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
                  onClick={() => onDelete(document)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Verwijderen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDuplicate(document)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(document)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
