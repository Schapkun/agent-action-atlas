
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DocumentTemplateWithLabels } from '@/types/documentLabels';

interface TemplateSelectorProps {
  selectedTemplate: DocumentTemplateWithLabels | null;
  availableTemplates: DocumentTemplateWithLabels[];
  templatesLoading: boolean;
  onTemplateSelect: (template: DocumentTemplateWithLabels) => void;
}

export const TemplateSelector = ({
  selectedTemplate,
  availableTemplates,
  templatesLoading,
  onTemplateSelect
}: TemplateSelectorProps) => {
  const handleTemplateChange = (templateId: string) => {
    const template = availableTemplates.find(t => t.id === templateId);
    if (template) {
      onTemplateSelect(template);
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
        {availableTemplates.map((template) => (
          <SelectItem key={template.id} value={template.id} className="text-xs">
            {template.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
