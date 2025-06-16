
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, X, ChevronDown } from 'lucide-react';
import { useDocumentTemplateLabels } from '@/hooks/useDocumentTemplateLabels';
import { DocumentTemplateLabel } from '@/types/documentLabels';

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
  const { labels } = useDocumentTemplateLabels();
  const [isOpen, setIsOpen] = useState(false);

  const handleLabelClick = (label: DocumentTemplateLabel) => {
    const isSelected = selectedLabels.some(l => l.id === label.id);
    
    if (isSelected) {
      onLabelsChange(selectedLabels.filter(l => l.id !== label.id));
    } else {
      onLabelsChange([...selectedLabels, label]);
    }
  };

  const removeLabel = (labelId: string) => {
    onLabelsChange(selectedLabels.filter(l => l.id !== labelId));
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Filter op labels:</span>
      </div>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            {selectedLabels.length === 0 ? (
              'Selecteer labels'
            ) : (
              `${selectedLabels.length} geselecteerd`
            )}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="start">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Beschikbare Labels</h4>
            {labels.length === 0 ? (
              <p className="text-sm text-gray-500">Geen labels beschikbaar</p>
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {labels.map((label) => {
                  const isSelected = selectedLabels.some(l => l.id === label.id);
                  return (
                    <div
                      key={label.id}
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleLabelClick(label)}
                    >
                      <Badge
                        variant="secondary"
                        style={{ 
                          backgroundColor: label.color, 
                          color: 'white',
                          border: 'none'
                        }}
                      >
                        {label.name}
                      </Badge>
                      {isSelected && (
                        <span className="text-blue-600 font-bold">✓</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected labels display */}
      {selectedLabels.map((label) => (
        <Badge
          key={label.id}
          variant="secondary"
          style={{ 
            backgroundColor: label.color, 
            color: 'white',
            border: 'none'
          }}
          className="flex items-center gap-1"
        >
          {label.name}
          <button
            className="ml-1 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5"
            onClick={() => removeLabel(label.id)}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      
      {selectedLabels.length > 0 && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearFilters}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
          Wis filters
        </Button>
      )}
    </div>
  );
};
