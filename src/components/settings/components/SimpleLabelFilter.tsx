
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Filter } from 'lucide-react';
import { DocumentTemplateLabel } from '@/types/documentLabels';
import { LabelDropdown } from './LabelDropdown';

interface SimpleLabelFilterProps {
  selectedLabels: DocumentTemplateLabel[];
  onLabelsChange: (labels: DocumentTemplateLabel[]) => void;
  onClearFilters: () => void;
}

export const SimpleLabelFilter = ({
  selectedLabels,
  onLabelsChange,
  onClearFilters
}: SimpleLabelFilterProps) => {
  const removeLabel = (labelToRemove: DocumentTemplateLabel) => {
    const updatedLabels = selectedLabels.filter(label => label.id !== labelToRemove.id);
    onLabelsChange(updatedLabels);
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Filter op labels:</span>
      </div>
      
      <div className="flex items-center gap-2 flex-1">
        <LabelDropdown
          selectedLabels={selectedLabels}
          onLabelsChange={onLabelsChange}
          triggerText="Label selecteren"
        />
        
        {selectedLabels.length > 0 && (
          <div className="flex items-center gap-1">
            {selectedLabels.map((label) => (
              <Badge
                key={label.id}
                style={{ backgroundColor: label.color, color: 'white' }}
                className="text-xs flex items-center gap-1"
              >
                {label.name}
                <button
                  onClick={() => removeLabel(label)}
                  className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      {selectedLabels.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="text-xs"
        >
          Alle filters wissen
        </Button>
      )}
    </div>
  );
};
