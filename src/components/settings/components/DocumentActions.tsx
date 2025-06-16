
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { DocumentTemplateLabelsDialog } from './DocumentTemplateLabelsDialog';

interface DocumentActionsProps {
  onNewDocument: () => void;
}

export const DocumentActions = ({ onNewDocument }: DocumentActionsProps) => {
  const [isLabelsDialogOpen, setIsLabelsDialogOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3">
        <Button onClick={onNewDocument} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nieuw Document Template
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => setIsLabelsDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Beheer Labels
        </Button>
      </div>

      <DocumentTemplateLabelsDialog
        open={isLabelsDialogOpen}
        onClose={() => setIsLabelsDialogOpen(false)}
      />
    </>
  );
};
