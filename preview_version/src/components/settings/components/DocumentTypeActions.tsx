
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface DocumentTypeActionsProps {
  onNewDocumentType: () => void;
}

export const DocumentTypeActions = ({
  onNewDocumentType
}: DocumentTypeActionsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={onNewDocumentType} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nieuw Document Type
          </Button>
        </div>
      </div>
    </div>
  );
};
