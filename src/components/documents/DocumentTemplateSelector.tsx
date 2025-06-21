
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDocumentTemplateManager } from '@/hooks/useDocumentTemplateManager';

interface DocumentTemplateSelectorProps {
  documentType: string;
  selectedTemplate: any;
  onTemplateSelect: (template: any) => void;
}

export const DocumentTemplateSelector = ({
  documentType,
  selectedTemplate,
  onTemplateSelect
}: DocumentTemplateSelectorProps) => {
  const {
    availableTemplates,
    templatesLoading,
    noLabelConfigured
  } = useDocumentTemplateManager(documentType);

  if (noLabelConfigured && !templatesLoading) {
    return (
      <div className="h-10 px-3 py-2 text-sm text-gray-500 bg-gray-100 rounded-md border">
        Stel eerst een label in bij instellingen → documenten
      </div>
    );
  }

  return (
    <Select
      value={selectedTemplate?.id || ''}
      onValueChange={(templateId) => {
        const template = availableTemplates.find(t => t.id === templateId);
        onTemplateSelect(template || null);
      }}
      disabled={templatesLoading || !documentType}
    >
      <SelectTrigger>
        <SelectValue 
          placeholder={
            templatesLoading 
              ? "Templates laden..." 
              : !documentType 
                ? "Selecteer eerst een document type"
                : "Selecteer template"
          } 
        />
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
