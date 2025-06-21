
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
    if (labelId === 'all') {
      onLabelSelect(null);
    } else {
      const label = labels.find(l => l.id === labelId);
      onLabelSelect(label || null);
    }
  };

  return (
    <Select
      value={selectedLabel?.id || 'all'}
      onValueChange={handleLabelChange}
      disabled={disabled || loading}
    >
      <SelectTrigger className="h-8 text-xs">
        <SelectValue placeholder={loading ? "Laden..." : "Alle templates"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">
          <span className="text-xs">Alle templates</span>
        </SelectItem>
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
