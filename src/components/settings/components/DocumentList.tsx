
import React from 'react';
import { FileText } from 'lucide-react';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { DocumentListItem } from './DocumentListItem';

interface DocumentListProps {
  documents: DocumentTemplate[];
  onEditDocument: (document: DocumentTemplate) => void;
  onDuplicateDocument: (document: DocumentTemplate) => void;
  onDeleteDocument: (document: DocumentTemplate) => void;
}

export const DocumentList = ({ 
  documents, 
  onEditDocument, 
  onDuplicateDocument, 
  onDeleteDocument 
}: DocumentListProps) => {
  if (documents.length === 0) {
    return (
      <div className="rounded-lg border">
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Geen templates gevonden</p>
          <p className="text-sm">Klik op "Nieuw Document Template" om te beginnen</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <div className="divide-y">
        {documents.map((document) => (
          <DocumentListItem
            key={document.id}
            document={document}
            onEdit={onEditDocument}
            onDuplicate={onDuplicateDocument}
            onDelete={onDeleteDocument}
          />
        ))}
      </div>
    </div>
  );
};
