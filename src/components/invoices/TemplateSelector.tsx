
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';
import type { DocumentTemplate } from '@/hooks/useDocumentTemplatesCreate';
import type { DocumentTemplateWithTags } from '@/types/documentTags';

interface TemplateSelectorProps {
  selectedTemplate: DocumentTemplate | DocumentTemplateWithTags | null;
  onTemplateChange?: (template: DocumentTemplate | null) => void;
  onTemplateSelect?: (template: DocumentTemplateWithTags) => void;
  availableTemplates?: DocumentTemplateWithTags[];
  templatesLoading?: boolean;
  noLabelConfigured?: boolean;
}

export const TemplateSelector = ({
  selectedTemplate,
  onTemplateChange,
  onTemplateSelect,
  availableTemplates,
  templatesLoading: propTemplatesLoading,
  noLabelConfigured = false
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
        onTemplateSelect(template as DocumentTemplateWithTags);
      }
      if (onTemplateChange) {
        // Create a compatible DocumentTemplate object
        const compatibleTemplate: DocumentTemplate = {
          ...template
        };
        onTemplateChange(compatibleTemplate);
      }
    }
  };

  // Show message when no label is configured
  if (noLabelConfigured && !templatesLoading) {
    return (
      <div className="h-8 px-3 py-2 text-xs text-gray-500 bg-gray-100 rounded-md border">
        Stel eerst een label in bij instellingen
      </div>
    );
  }

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
