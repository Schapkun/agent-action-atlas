
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit } from 'lucide-react';
import { useDocumentTemplateLabels } from '@/hooks/useDocumentTemplateLabels';
import { DocumentTemplateLabel } from '@/types/documentLabels';
import { DocumentTemplateLabelsDialog } from './DocumentTemplateLabelsDialog';

interface FilterLabelDropdownProps {
  selectedLabels: DocumentTemplateLabel[];
  onLabelsChange: (labels: DocumentTemplateLabel[]) => void;
  triggerText?: string;
  disabled?: boolean;
}

export const FilterLabelDropdown = ({
  selectedLabels = [],
  onLabelsChange,
  triggerText = "Label selecteren",
  disabled = false
}: FilterLabelDropdownProps) => {
  const { labels } = useDocumentTemplateLabels();
  const [isOpen, setIsOpen] = useState(false);
  const [isLabelsDialogOpen, setIsLabelsDialogOpen] = useState(false);

  const handleLabelToggle = (label: DocumentTemplateLabel, checked: boolean) => {
    console.log('[FilterLabelDropdown] Toggling label:', label.name, 'checked:', checked);
    
    let newLabels: DocumentTemplateLabel[];
    
    if (checked) {
      // Add label if not already present
      if (!selectedLabels.some(l => l.id === label.id)) {
        newLabels = [...selectedLabels, label];
      } else {
        newLabels = selectedLabels;
      }
    } else {
      // Remove label
      newLabels = selectedLabels.filter(l => l.id !== label.id);
    }
    
    console.log('[FilterLabelDropdown] New labels:', newLabels);
    onLabelsChange(newLabels);
  };

  const handleEditLabels = () => {
    setIsOpen(false);
    setIsLabelsDialogOpen(true);
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            className="text-sm"
          >
            <Plus className="h-3 w-3 mr-1" />
            {triggerText}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3 bg-white border border-gray-200 shadow-lg z-50">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Beschikbare labels</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditLabels}
                className="h-6 w-6 p-0 hover:bg-gray-100"
                title="Labels beheren"
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
            
            {labels.length === 0 && (
              <p className="text-xs text-gray-500">Geen labels beschikbaar</p>
            )}
            
            {labels.map((label) => {
              const checked = selectedLabels.some(l => l.id === label.id);
              
              return (
                <div key={label.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`filter-label-${label.id}`}
                    checked={checked}
                    onCheckedChange={(newChecked) => {
                      handleLabelToggle(label, newChecked as boolean);
                    }}
                  />
                  <label
                    htmlFor={`filter-label-${label.id}`}
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

      <DocumentTemplateLabelsDialog
        open={isLabelsDialogOpen}
        onClose={() => setIsLabelsDialogOpen(false)}
      />
    </>
  );
};
