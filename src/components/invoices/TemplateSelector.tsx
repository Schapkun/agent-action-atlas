
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';
import type { DocumentTemplate } from '@/hooks/useDocumentTemplatesCreate';

interface TemplateSelectorProps {
  selectedTemplate: DocumentTemplate | null;
  onTemplateChange: (template: DocumentTemplate | null) => void;
}

export const TemplateSelector = ({
  selectedTemplate,
  onTemplateChange
}: TemplateSelectorProps) => {
  const { templates, loading: templatesLoading } = useDocumentTemplates();

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Create a compatible DocumentTemplate object
      const compatibleTemplate: DocumentTemplate = {
        ...template,
        labels: template.labels || [] // Ensure labels property exists
      };
      onTemplateChange(compatibleTemplate);
    }
  };

  return (
    <Select
      value={selectedTemplate?.id || ''}
      onValueChange={handleTemplateChange}
      disabled={templatesLoading}
    >
      <SelectTrigger className="text-xs h-8 w-full">
        <SelectValue placeholder={templatesLoading ? "Laden..." : "Selecteer template"} />
      </SelectTrigger>
      <SelectContent className="w-full min-w-[var(--radix-select-trigger-width)]">
        {templates.map((template) => (
          <SelectItem key={template.id} value={template.id} className="text-xs">
            {template.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
