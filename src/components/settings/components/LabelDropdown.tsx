
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, Tags } from 'lucide-react';
import { useDocumentTemplateLabels } from '@/hooks/useDocumentTemplateLabels';
import { DocumentTemplateLabel } from '@/types/documentLabels';

interface LabelDropdownProps {
  selectedLabels: DocumentTemplateLabel[];
  onLabelsChange: (labels: DocumentTemplateLabel[]) => void;
  disabled?: boolean;
}

export const LabelDropdown = ({ selectedLabels, onLabelsChange, disabled }: LabelDropdownProps) => {
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

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled} className="flex items-center gap-2">
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
  );
};
