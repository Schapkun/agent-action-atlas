
import React, { useState } from 'react';
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
  
  // Local state to manage selections while dropdown is open
  const [localSelectedLabels, setLocalSelectedLabels] = useState<DocumentTemplateLabel[]>(selectedLabels);

  // Update local state when props change
  React.useEffect(() => {
    setLocalSelectedLabels(selectedLabels);
  }, [selectedLabels]);

  const handleLabelToggle = (label: DocumentTemplateLabel, checked: boolean) => {
    console.log('[LabelDropdown] Toggling label:', label.name, 'checked:', checked);
    
    let newLabels: DocumentTemplateLabel[];
    
    if (checked) {
      // Add label if not already selected
      if (!localSelectedLabels.find(l => l.id === label.id)) {
        newLabels = [...localSelectedLabels, label];
      } else {
        newLabels = localSelectedLabels; // Already selected, no change
      }
    } else {
      // Remove label
      newLabels = localSelectedLabels.filter(l => l.id !== label.id);
    }
    
    console.log('[LabelDropdown] New local labels:', newLabels.map(l => l.name));
    
    // Update local state immediately for responsive UI
    setLocalSelectedLabels(newLabels);
    
    // Call parent handler to update database
    onLabelsChange(newLabels);
  };

  const handleEditLabels = () => {
    console.log('[LabelDropdown] Opening labels management dialog');
    setIsOpen(false); // Close the dropdown
    setIsLabelsDialogOpen(true); // Open the labels dialog
  };

  const handleLabelsDialogClose = async () => {
    console.log('[LabelDropdown] Labels dialog closed, refreshing labels');
    setIsLabelsDialogOpen(false);
    // Refresh labels when the dialog closes to show newly created labels
    await fetchLabels();
  };

  const handleOpenChange = (open: boolean) => {
    console.log('[LabelDropdown] Dropdown open state changed:', open);
    setIsOpen(open);
    
    if (!open) {
      // When closing, reset local state to match props
      setLocalSelectedLabels(selectedLabels);
    }
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
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

      <DocumentTemplateLabelsDialog
        open={isLabelsDialogOpen}
        onClose={handleLabelsDialogClose}
      />
    </>
  );
};
