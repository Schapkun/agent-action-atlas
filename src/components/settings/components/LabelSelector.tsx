
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Tag, X } from 'lucide-react';
import { useDocumentTemplateLabels } from '@/hooks/useDocumentTemplateLabels';
import { DocumentTemplateLabel } from '@/types/documentLabels';

interface LabelSelectorProps {
  selectedLabels: DocumentTemplateLabel[];
  onLabelsChange: (labels: DocumentTemplateLabel[]) => void;
  disabled?: boolean;
}

export const LabelSelector = ({ selectedLabels, onLabelsChange, disabled }: LabelSelectorProps) => {
  const { labels } = useDocumentTemplateLabels();
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Labels:</span>
        
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" disabled={disabled}>
              <Plus className="h-4 w-4 mr-1" />
              Label toevoegen
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

      {/* Selected labels */}
      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedLabels.map((label) => (
            <div key={label.id} className="flex items-center">
              <Badge
                variant="secondary"
                style={{ 
                  backgroundColor: label.color, 
                  color: 'white',
                  border: 'none'
                }}
                className="pr-1"
              >
                {label.name}
                {!disabled && (
                  <button
                    className="ml-1 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5"
                    onClick={() => removeLabel(label.id)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
