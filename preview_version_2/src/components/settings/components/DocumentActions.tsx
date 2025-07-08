
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Library } from 'lucide-react';
import { SimpleTagFilter } from './SimpleTagFilter';

interface DocumentActionsProps {
  onNewDocument: () => void;
  onOpenLibrary: () => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  onClearFilters: () => void;
  availableTags: string[];
}

export const DocumentActions = ({
  onNewDocument,
  onOpenLibrary,
  selectedTags,
  onTagsChange,
  onClearFilters,
  availableTags
}: DocumentActionsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={onNewDocument} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nieuw Document
          </Button>
          <Button onClick={onOpenLibrary} variant="outline" className="flex items-center gap-2">
            <Library className="h-4 w-4" />
            Bibliotheek
          </Button>
        </div>
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
