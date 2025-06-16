
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, X, Tags, ChevronDown } from 'lucide-react';
import { useDocumentTemplateLabels } from '@/hooks/useDocumentTemplateLabels';
import { DocumentTemplateLabel } from '@/types/documentLabels';

interface CompactDocumentFiltersProps {
  selectedLabels: DocumentTemplateLabel[];
  onLabelsChange: (labels: DocumentTemplateLabel[]) => void;
  onClearFilters: () => void;
}

export const CompactDocumentFilters = ({
  selectedLabels,
  onLabelsChange,
  onClearFilters
}: CompactDocumentFiltersProps) => {
  const { labels } = useDocumentTemplateLabels();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLabelToggle = (label: DocumentTemplateLabel) => {
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

  const hasActiveFilters = selectedLabels.length > 0;

  return (
    <div className="flex items-center gap-4 p-4 bg-white border rounded-lg">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="font-medium text-sm">Filters:</span>
      </div>

      <div className="flex items-center gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Tags className="h-4 w-4" />
              {selectedLabels.length === 0 ? (
                'Labels'
              ) : (
                `${selectedLabels.length} label(s)`
              )}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Filter op Labels</h4>
              
              {labels.length === 0 ? (
                <p className="text-sm text-gray-500">Geen labels beschikbaar</p>
              ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {labels.map((label) => {
                    const isSelected = selectedLabels.some(l => l.id === label.id);
                    return (
                      <button
                        key={label.id}
                        className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                          isSelected 
                            ? 'bg-blue-50 border border-blue-200' 
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                        onClick={() => handleLabelToggle(label)}
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
                          <span className="ml-2 text-blue-600">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Selected labels display */}
      {selectedLabels.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Actief:</span>
          <div className="flex flex-wrap gap-1">
            {selectedLabels.map((label) => (
              <div key={label.id} className="flex items-center">
                <Badge
                  variant="secondary"
                  style={{ 
                    backgroundColor: label.color, 
                    color: 'white',
                    border: 'none'
                  }}
                  className="pr-1 text-xs"
                >
                  {label.name}
                  <button
                    className="ml-1 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5"
                    onClick={() => removeLabel(label.id)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-gray-500 hover:text-gray-700 ml-auto"
        >
          <X className="h-4 w-4 mr-1" />
          Wissen
        </Button>
      )}
    </div>
  );
};
