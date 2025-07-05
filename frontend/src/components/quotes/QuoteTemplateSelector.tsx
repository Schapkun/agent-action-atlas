
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DocumentTemplateWithTags } from '@/types/documentTags';

interface QuoteTemplateSelectorProps {
  selectedTemplate: DocumentTemplateWithTags | null;
  availableTemplates: DocumentTemplateWithTags[];
  templatesLoading: boolean;
  onTemplateSelect: (template: DocumentTemplateWithTags | null) => void;
}

export const QuoteTemplateSelector = ({
  selectedTemplate,
  availableTemplates,
  templatesLoading,
  onTemplateSelect
}: QuoteTemplateSelectorProps) => {
  const handleTemplateChange = (templateId: string) => {
    const template = availableTemplates.find(t => t.id === templateId);
    onTemplateSelect(template || null);
  };

  return (
    <Select
      value={selectedTemplate?.id || ''}
      onValueChange={handleTemplateChange}
      disabled={templatesLoading}
    >
      <SelectTrigger className="h-8 text-xs">
        <SelectValue placeholder={templatesLoading ? "Laden..." : "Selecteer template"} />
      </SelectTrigger>
      <SelectContent>
        {availableTemplates.map((template) => (
          <SelectItem key={template.id} value={template.id}>
            {template.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
