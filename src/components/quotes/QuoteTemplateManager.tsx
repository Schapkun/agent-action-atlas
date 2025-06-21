
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DocumentTemplateWithTags } from '@/types/documentTags';

interface QuoteTemplateManagerProps {
  documentTemplates: DocumentTemplateWithTags[];
  templatesLoading: boolean;
  selectedTemplate: DocumentTemplateWithTags | null;
  setSelectedTemplate: (template: DocumentTemplateWithTags | null) => void;
}

export const QuoteTemplateManager = ({
  documentTemplates,
  templatesLoading,
  selectedTemplate,
  setSelectedTemplate
}: QuoteTemplateManagerProps) => {
  // Use all available templates since we no longer have tag filtering
  const availableTemplates = documentTemplates;

  const handleTemplateChange = (templateId: string) => {
    const template = availableTemplates.find(t => t.id === templateId);
    setSelectedTemplate(template || null);
  };

  return {
    availableTemplates,
    templateSelect: (
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
    )
  };
};
