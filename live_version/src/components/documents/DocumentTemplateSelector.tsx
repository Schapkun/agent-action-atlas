
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DocumentTemplateSelectorProps {
  selectedTemplate: any;
  availableTemplates: any[];
  templatesLoading: boolean;
  noLabelConfigured: boolean;
  documentType: string;
  onTemplateSelect: (template: any) => void;
}

export const DocumentTemplateSelector = ({
  selectedTemplate,
  availableTemplates,
  templatesLoading,
  noLabelConfigured,
  documentType,
  onTemplateSelect
}: DocumentTemplateSelectorProps) => {
  if (noLabelConfigured && !templatesLoading && documentType) {
    return (
      <div className="h-8 px-3 py-2 text-xs text-gray-500 bg-gray-100 rounded-md border flex items-center">
        Stel eerst een label in bij instellingen
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
      <SelectTrigger className="h-8 text-sm">
        <SelectValue 
          placeholder={
            templatesLoading 
              ? "Templates laden..." 
              : !documentType 
                ? "Selecteer eerst een type"
                : "Selecteer template"
          } 
        />
      </SelectTrigger>
      <SelectContent>
        {availableTemplates.map((template) => (
          <SelectItem key={template.id} value={template.id}>
            <div className="flex items-center gap-2">
              <span>{template.name}</span>
              {template.is_default && (
                <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">
                  Standaard
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
