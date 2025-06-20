
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, Plus } from 'lucide-react';
import { useDocumentTemplateLabels } from '@/hooks/useDocumentTemplateLabels';
import { DocumentTemplateLabel } from '@/types/documentLabels';

interface LabelDropdownProps {
  selectedLabels: DocumentTemplateLabel[];
  onLabelsChange: (labels: DocumentTemplateLabel[]) => void;
  triggerText?: string;
}

export const LabelDropdown = ({
  selectedLabels,
  onLabelsChange,
  triggerText = "Labels"
}: LabelDropdownProps) => {
  const { labels } = useDocumentTemplateLabels();
  const [isOpen, setIsOpen] = useState(false);

  const handleLabelToggle = (label: DocumentTemplateLabel, checked: boolean) => {
    if (checked) {
      // Add label if not already selected
      if (!selectedLabels.find(l => l.id === label.id)) {
        onLabelsChange([...selectedLabels, label]);
      }
    } else {
      // Remove label
      onLabelsChange(selectedLabels.filter(l => l.id !== label.id));
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="h-3 w-3" />
          {triggerText}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Beschikbare labels</h4>
          
          {labels.length === 0 && (
            <p className="text-xs text-gray-500">Geen labels beschikbaar</p>
          )}
          
          {labels.map((label) => {
            const isSelected = selectedLabels.some(l => l.id === label.id);
            
            return (
              <div key={label.id} className="flex items-center space-x-2">
                <Checkbox
                  id={label.id}
                  checked={isSelected}
                  onCheckedChange={(checked) => handleLabelToggle(label, checked as boolean)}
                />
                <label
                  htmlFor={label.id}
                  className="flex items-center gap-2 text-sm cursor-pointer flex-1"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: label.color }}
                  />
                  {label.name}
                </label>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
