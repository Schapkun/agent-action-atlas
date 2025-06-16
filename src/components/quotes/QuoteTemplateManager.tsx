
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DocumentTemplateWithLabels } from '@/types/documentLabels';

interface QuoteTemplateManagerProps {
  documentTemplates: DocumentTemplateWithLabels[];
  templatesLoading: boolean;
  selectedTemplate: DocumentTemplateWithLabels | null;
  setSelectedTemplate: (template: DocumentTemplateWithLabels | null) => void;
}

export const QuoteTemplateManager = ({
  documentTemplates,
  templatesLoading,
  selectedTemplate,
  setSelectedTemplate
}: QuoteTemplateManagerProps) => {
  // Filter templates that have "Offerte" label
  const availableTemplates = documentTemplates.filter(template => 
    template.labels?.some(label => label.name.toLowerCase() === 'offerte')
  );

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
