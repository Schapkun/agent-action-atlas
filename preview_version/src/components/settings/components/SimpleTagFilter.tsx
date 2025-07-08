
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface SimpleTagFilterProps {
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  onClearFilters: () => void;
}

export const SimpleTagFilter = ({
  availableTags,
  selectedTags,
  onTagsChange,
  onClearFilters
}: SimpleTagFilterProps) => {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  if (availableTags.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Filter op tags:</h4>
        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs h-7"
          >
            <X className="h-3 w-3 mr-1" />
            Wis filters
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <Badge
              key={tag}
              variant={isSelected ? "default" : "outline"}
              className={`cursor-pointer text-xs ${
                isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
              }`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          );
        })}
      </div>
      
      {selectedTags.length > 0 && (
        <div className="text-xs text-gray-600">
          {selectedTags.length} tag{selectedTags.length === 1 ? '' : 's'} geselecteerd
        </div>
      )}
    </div>
  );
};
