
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useDocumentTemplateLabels } from '@/hooks/useDocumentTemplateLabels';
import { DocumentTemplateLabel } from '@/types/documentLabels';
import { LabelDropdown } from './LabelDropdown';

interface LabelSelectorProps {
  selectedLabels: DocumentTemplateLabel[];
  onLabelsChange: (labels: DocumentTemplateLabel[]) => void;
}

export const LabelSelector = ({
  selectedLabels,
  onLabelsChange
}: LabelSelectorProps) => {
  const { assignLabelToTemplate, removeLabelFromTemplate } = useDocumentTemplateLabels();

  const removeLabel = (labelToRemove: DocumentTemplateLabel) => {
    const updatedLabels = selectedLabels.filter(label => label.id !== labelToRemove.id);
    onLabelsChange(updatedLabels);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Labels:</span>
        <LabelDropdown
          selectedLabels={selectedLabels}
          onLabelsChange={onLabelsChange}
          triggerText="Label toevoegen"
        />
      </div>
      
      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedLabels.map((label) => (
            <Badge
              key={label.id}
              style={{ backgroundColor: label.color, color: 'white' }}
              className="text-xs flex items-center gap-2"
            >
              {label.name}
              <button
                onClick={() => removeLabel(label)}
                className="hover:bg-white/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
