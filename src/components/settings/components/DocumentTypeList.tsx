
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DocumentType } from '@/hooks/useDocumentTypes';

interface DocumentTypeListProps {
  documentTypes: DocumentType[];
  onEditDocumentType: (documentType: DocumentType, baseDocumentType?: DocumentType) => void;
  onDeleteDocumentType: (documentType: DocumentType) => void;
}

export const DocumentTypeList = ({
  documentTypes,
  onEditDocumentType,
  onDeleteDocumentType
}: DocumentTypeListProps) => {
  const [editDropdownOpen, setEditDropdownOpen] = useState<string | null>(null);

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

  const handleEditWithBase = (documentType: DocumentType, baseDocumentType?: DocumentType) => {
    onEditDocumentType(documentType, baseDocumentType);
    setEditDropdownOpen(null);
  };

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
              {/* Edit dropdown */}
              <DropdownMenu 
                open={editDropdownOpen === documentType.id} 
                onOpenChange={(open) => setEditDropdownOpen(open ? documentType.id : null)}
              >
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-background border shadow-lg">
                  <DropdownMenuItem 
                    onClick={() => handleEditWithBase(documentType)}
                    className="cursor-pointer"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Leeg beginnen
                  </DropdownMenuItem>
                  {documentTypes
                    .filter(dt => dt.id !== documentType.id)
                    .map((baseType) => (
                      <DropdownMenuItem 
                        key={baseType.id}
                        onClick={() => handleEditWithBase(documentType, baseType)}
                        className="cursor-pointer"
                      >
                        <span className="mr-2">📄</span>
                        Baseren op "{baseType.label}"
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Delete button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDeleteDocumentType(documentType)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
