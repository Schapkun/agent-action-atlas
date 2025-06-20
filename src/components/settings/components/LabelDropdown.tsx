
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit } from 'lucide-react';
import { useDocumentTemplateLabels } from '@/hooks/useDocumentTemplateLabels';
import { DocumentTemplateLabel } from '@/types/documentLabels';
import { DocumentTemplateLabelsDialog } from './DocumentTemplateLabelsDialog';

interface LabelDropdownProps {
  documentId: string;
  selectedLabelIds: string[];
  onLabelsUpdate: (labelIds: string[]) => void;
  disabled?: boolean;
}

export const LabelDropdown = ({
  documentId,
  selectedLabelIds,
  onLabelsUpdate,
  disabled = false
}: LabelDropdownProps) => {
  const { labels } = useDocumentTemplateLabels();
  const [isOpen, setIsOpen] = useState(false);
  const [isLabelsDialogOpen, setIsLabelsDialogOpen] = useState(false);

  const handleLabelToggle = (label: DocumentTemplateLabel, checked: boolean) => {
    console.log('[LabelDropdown] Toggling label:', label.name, 'checked:', checked);
    
    let newLabelIds: string[];
    
    if (checked) {
      // Add label if not already present
      if (!selectedLabelIds.includes(label.id)) {
        newLabelIds = [...selectedLabelIds, label.id];
      } else {
        newLabelIds = selectedLabelIds;
      }
    } else {
      // Remove label
      newLabelIds = selectedLabelIds.filter(id => id !== label.id);
    }
    
    console.log('[LabelDropdown] New label IDs:', newLabelIds);
    onLabelsUpdate(newLabelIds);
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
              const checked = selectedLabelIds.includes(label.id);
              
              return (
                <div key={label.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`label-${label.id}`}
                    checked={checked}
                    onCheckedChange={(newChecked) => {
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
        onClose={() => setIsLabelsDialogOpen(false)}
      />
    </>
  );
};
