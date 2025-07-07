
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { DocumentType } from '@/hooks/useDocumentTypes';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';

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
  const { templates } = useDocumentTemplates();

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

  const getTemplateName = (templateId?: string) => {
    if (!templateId) return 'Geen template gekoppeld';
    const template = templates.find(t => t.id === templateId);
    return template ? `Template: ${template.name}` : 'Template niet gevonden';
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
                    {getTemplateName(documentType.default_template_id)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Edit button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => onEditDocumentType(documentType)}
              >
                <Edit className="h-4 w-4" />
              </Button>

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
