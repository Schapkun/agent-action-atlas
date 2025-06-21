
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useDocumentTemplateLabels } from '@/hooks/useDocumentTemplateLabels';
import { DocumentTemplateLabel } from '@/types/documentTemplateLabels';

interface DocumentLabelSelectorProps {
  selectedLabel: DocumentTemplateLabel | null;
  onLabelSelect: (label: DocumentTemplateLabel | null) => void;
  disabled?: boolean;
}

export const DocumentLabelSelector = ({
  selectedLabel,
  onLabelSelect,
  disabled = false
}: DocumentLabelSelectorProps) => {
  const { labels, loading } = useDocumentTemplateLabels();

  const handleLabelChange = (labelId: string) => {
    const label = labels.find(l => l.id === labelId);
    onLabelSelect(label || null);
  };

  // Auto-select first label if none is selected and labels are available
  React.useEffect(() => {
    if (!selectedLabel && labels.length > 0 && !loading) {
      onLabelSelect(labels[0]);
    }
  }, [labels, selectedLabel, loading, onLabelSelect]);

  // Don't render the selector if no labels are available
  if (!loading && labels.length === 0) {
    return (
      <div className="h-8 px-3 py-2 text-xs text-gray-500 bg-gray-100 rounded-md border">
        Geen labels beschikbaar
      </div>
    );
  }

  return (
    <Select
      value={selectedLabel?.id || ''}
      onValueChange={handleLabelChange}
      disabled={disabled || loading}
    >
      <SelectTrigger className="h-8 text-xs">
        <SelectValue placeholder={loading ? "Laden..." : "Selecteer label"} />
      </SelectTrigger>
      <SelectContent>
        {labels.map((label) => (
          <SelectItem key={label.id} value={label.id}>
            <div className="flex items-center gap-2">
              <Badge
                style={{ backgroundColor: label.color, color: 'white' }}
                className="text-xs"
              >
                {label.name}
              </Badge>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
