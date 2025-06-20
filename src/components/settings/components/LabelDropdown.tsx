
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
  
  // Local state to manage selections without triggering parent updates
  const [localSelectedLabels, setLocalSelectedLabels] = useState<DocumentTemplateLabel[]>([]);

  // Initialize local state when popover opens
  useEffect(() => {
    if (isOpen) {
      console.log('[LabelDropdown] Popover opened, initializing local state with:', selectedLabels.map(l => l.name));
      setLocalSelectedLabels([...selectedLabels]);
    }
  }, [isOpen, selectedLabels]);

  // Also sync when selectedLabels changes and popover is closed
  useEffect(() => {
    if (!isOpen) {
      console.log('[LabelDropdown] Syncing with external state:', selectedLabels.map(l => l.name));
      setLocalSelectedLabels([...selectedLabels]);
    }
  }, [selectedLabels, isOpen]);

  const handleLabelToggle = (label: DocumentTemplateLabel, checked: boolean) => {
    console.log('[LabelDropdown] Toggle label:', label.name, 'checked:', checked);
    console.log('[LabelDropdown] Current local state before toggle:', localSelectedLabels.map(l => l.name));
    
    setLocalSelectedLabels(prev => {
      let newLabels: DocumentTemplateLabel[];
      
      if (checked) {
        // Add label if not already selected
        if (!prev.find(l => l.id === label.id)) {
          newLabels = [...prev, label];
        } else {
          console.log('[LabelDropdown] Label already selected, no change');
          return prev;
        }
      } else {
        // Remove label
        newLabels = prev.filter(l => l.id !== label.id);
      }
      
      console.log('[LabelDropdown] New local state after toggle:', newLabels.map(l => l.name));
      return newLabels;
    });
  };

  const handlePopoverOpenChange = (open: boolean) => {
    console.log('[LabelDropdown] Popover open change:', open);
    setIsOpen(open);
    
    if (!open) {
      // Popover is closing - compare local state with original and update if different
      const hasChanges = localSelectedLabels.length !== selectedLabels.length ||
        localSelectedLabels.some(local => !selectedLabels.find(original => original.id === local.id)) ||
        selectedLabels.some(original => !localSelectedLabels.find(local => local.id === original.id));
      
      if (hasChanges) {
        console.log('[LabelDropdown] Changes detected, calling onLabelsChange with:', localSelectedLabels.map(l => l.name));
        onLabelsChange([...localSelectedLabels]);
      } else {
        console.log('[LabelDropdown] No changes detected');
      }
    }
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
              const isSelected = localSelectedLabels.some(l => l.id === label.id);
              console.log('[LabelDropdown] Rendering label:', label.name, 'isSelected:', isSelected, 'localState:', localSelectedLabels.map(l => l.name));
              
              return (
                <div key={label.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`label-${label.id}`}
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      console.log('[LabelDropdown] Checkbox onCheckedChange for', label.name, 'to:', checked);
                      handleLabelToggle(label, checked as boolean);
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
