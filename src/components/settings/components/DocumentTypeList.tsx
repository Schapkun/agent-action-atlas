
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DocumentType } from '@/hooks/useDocumentTypes';

interface DocumentTypeListProps {
  documentTypes: DocumentType[];
  onEditDocumentType: (documentType: DocumentType) => void;
  onDeleteDocumentType: (documentType: DocumentType) => void;
}

export const DocumentTypeList = ({
  documentTypes,
  onEditDocumentType,
  onDeleteDocumentType
}: DocumentTypeListProps) => {
  if (documentTypes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Geen document types gevonden.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Klik op "Nieuw Document Type" om te beginnen.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {documentTypes.map((documentType) => (
        <Card key={documentType.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-medium">{documentType.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    Naam: {documentType.name}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEditDocumentType(documentType)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Bewerken
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDeleteDocumentType(documentType)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Verwijderen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
