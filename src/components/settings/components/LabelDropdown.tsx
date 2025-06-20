
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit } from 'lucide-react';
import { useDocumentTemplateLabels } from '@/hooks/useDocumentTemplateLabels';
import { DocumentTemplateLabel } from '@/types/documentLabels';
import { DocumentTemplateLabelsDialog } from './DocumentTemplateLabelsDialog';

interface LabelDropdownProps {
  selectedLabels: DocumentTemplateLabel[];
  onLabelsChange: (labels: DocumentTemplateLabel[]) => void;
  triggerText?: string;
  disabled?: boolean;
}

export const LabelDropdown = ({
  selectedLabels,
  onLabelsChange,
  triggerText,
  disabled = false
}: LabelDropdownProps) => {
  const { labels, fetchLabels } = useDocumentTemplateLabels();
  const [isOpen, setIsOpen] = useState(false);
  const [isLabelsDialogOpen, setIsLabelsDialogOpen] = useState(false);
  const [workingLabels, setWorkingLabels] = useState<DocumentTemplateLabel[]>([]);

  // Initialize working labels when popover opens
  useEffect(() => {
    if (isOpen) {
      console.log('[LabelDropdown] Popover opened - initializing working labels:', selectedLabels.map(l => l.name));
      setWorkingLabels([...selectedLabels]);
    }
  }, [isOpen, selectedLabels]);

  const isLabelSelected = (labelId: string): boolean => {
    const selected = workingLabels.some(l => l.id === labelId);
    console.log('[LabelDropdown] Checking if label is selected:', labelId, '=', selected);
    return selected;
  };

  const handleLabelToggle = (label: DocumentTemplateLabel, checked: boolean) => {
    console.log('[LabelDropdown] Toggling label:', label.name, 'to checked:', checked);
    
    setWorkingLabels(currentLabels => {
      const isCurrentlySelected = currentLabels.some(l => l.id === label.id);
      console.log('[LabelDropdown] Currently selected:', isCurrentlySelected);
      
      let newLabels: DocumentTemplateLabel[];
      
      if (checked && !isCurrentlySelected) {
        newLabels = [...currentLabels, label];
        console.log('[LabelDropdown] Adding label - new working list:', newLabels.map(l => l.name));
      } else if (!checked && isCurrentlySelected) {
        newLabels = currentLabels.filter(l => l.id !== label.id);
        console.log('[LabelDropdown] Removing label - new working list:', newLabels.map(l => l.name));
      } else {
        console.log('[LabelDropdown] No change needed');
        return currentLabels;
      }
      
      // IMMEDIATELY call onLabelsChange with the new labels
      console.log('[LabelDropdown] IMMEDIATELY calling onLabelsChange with:', newLabels.map(l => l.name));
      onLabelsChange(newLabels);
      
      return newLabels;
    });
  };

  const handlePopoverOpenChange = (open: boolean) => {
    console.log('[LabelDropdown] Popover state changing to:', open);
    setIsOpen(open);
  };

  const handleEditLabels = () => {
    console.log('[LabelDropdown] Opening labels management dialog');
    setIsOpen(false);
    setIsLabelsDialogOpen(true);
  };

  const handleLabelsDialogClose = async () => {
    console.log('[LabelDropdown] Labels dialog closed, refreshing labels');
    setIsLabelsDialogOpen(false);
    await fetchLabels();
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={handlePopoverOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost" 
            size="sm"
            className="h-5 w-5 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center"
            disabled={disabled}
            title="Label toevoegen"
          >
            <Plus className="h-3 w-3" />
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
              const checked = isLabelSelected(label.id);
              console.log('[LabelDropdown] Rendering checkbox for', label.name, 'checked:', checked);
              
              return (
                <div key={label.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`label-${label.id}`}
                    checked={checked}
                    onCheckedChange={(newChecked) => {
                      console.log('[LabelDropdown] Checkbox onCheckedChange for', label.name, 'new value:', newChecked);
                      handleLabelToggle(label, newChecked as boolean);
                    }}
                  />
                  <label
                    htmlFor={`label-${label.id}`}
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
        onClose={handleLabelsDialogClose}
      />
    </>
  );
};
