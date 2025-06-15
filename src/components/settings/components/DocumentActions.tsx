
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface DocumentActionsProps {
  onNewDocument: () => void;
}

export const DocumentActions = ({ onNewDocument }: DocumentActionsProps) => {
  return (
    <div className="flex items-center gap-4">
      <Button onClick={onNewDocument} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Nieuw Document Template
      </Button>
    </div>
  );
};
