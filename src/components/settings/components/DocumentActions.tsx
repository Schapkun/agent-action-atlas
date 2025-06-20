
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SimpleTagFilter } from './SimpleTagFilter';

interface DocumentActionsProps {
  onNewDocument: () => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  onClearFilters: () => void;
  availableTags: string[];
}

export const DocumentActions = ({
  onNewDocument,
  selectedTags,
  onTagsChange,
  onClearFilters,
  availableTags
}: DocumentActionsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button onClick={onNewDocument} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nieuw Document
        </Button>
      </div>

      <SimpleTagFilter
        availableTags={availableTags}
        selectedTags={selectedTags}
        onTagsChange={onTagsChange}
        onClearFilters={onClearFilters}
      />
    </div>
  );
};
