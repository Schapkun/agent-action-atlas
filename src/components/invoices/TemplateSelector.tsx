
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';
import type { DocumentTemplate } from '@/hooks/useDocumentTemplatesCreate';
import type { DocumentTemplateWithLabels } from '@/types/documentLabels';

interface TemplateSelectorProps {
  selectedTemplate: DocumentTemplate | DocumentTemplateWithLabels | null;
  onTemplateChange?: (template: DocumentTemplate | null) => void;
  onTemplateSelect?: (template: DocumentTemplateWithLabels) => void;
  availableTemplates?: DocumentTemplateWithLabels[];
  templatesLoading?: boolean;
}

export const TemplateSelector = ({
  selectedTemplate,
  onTemplateChange,
  onTemplateSelect,
  availableTemplates,
  templatesLoading: propTemplatesLoading
}: TemplateSelectorProps) => {
  const { templates: hookTemplates, loading: hookTemplatesLoading } = useDocumentTemplates();

  // Use provided templates or fallback to hook templates
  const templates = availableTemplates || hookTemplates;
  const templatesLoading = propTemplatesLoading !== undefined ? propTemplatesLoading : hookTemplatesLoading;

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Handle both callback types
      if (onTemplateSelect) {
        onTemplateSelect(template as DocumentTemplateWithLabels);
      }
      if (onTemplateChange) {
        // Create a compatible DocumentTemplate object
        const compatibleTemplate: DocumentTemplate = {
          ...template,
          labels: template.labels || [] // Ensure labels property exists
        };
        onTemplateChange(compatibleTemplate);
      }
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
