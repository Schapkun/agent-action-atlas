
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star } from 'lucide-react';
import { DocumentTemplateWithLabels } from '@/types/documentLabels';

interface TemplateSelectorProps {
  selectedTemplate: DocumentTemplateWithLabels | null;
  availableTemplates: DocumentTemplateWithLabels[];
  templatesLoading: boolean;
  onTemplateSelect: (templateId: string) => void;
}

export const TemplateSelector = ({
  selectedTemplate,
  availableTemplates,
  templatesLoading,
  onTemplateSelect
}: TemplateSelectorProps) => {
  const getCurrentSelectionLabel = () => {
    if (selectedTemplate) {
      return selectedTemplate.name;
    }
    if (templatesLoading) {
      return "Laden...";
    }
    if (availableTemplates.length === 0) {
      return "Geen factuur templates gevonden";
    }
    return "Selecteer template";
  };

  console.log('🎨 TemplateSelector render:', {
    selectedTemplate: selectedTemplate?.name,
    availableCount: availableTemplates.length,
    loading: templatesLoading,
    availableTemplates: availableTemplates.map(t => ({
      name: t.name,
      isDefault: t.is_default,
      labels: t.labels?.map(l => l.name)
    }))
  });

  return (
    <Select
      value={selectedTemplate?.id || ''}
      onValueChange={onTemplateSelect}
      disabled={templatesLoading || availableTemplates.length === 0}
    >
      <SelectTrigger className="h-8 text-xs flex-1">
        <div className="flex items-center gap-2">
          {selectedTemplate?.is_default && (
            <Star className="h-3 w-3 text-yellow-500 fill-current" />
          )}
          <SelectValue>
            {getCurrentSelectionLabel()}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent className="w-64 max-h-80 bg-white border shadow-lg z-50">
        {availableTemplates.length === 0 ? (
          <div className="py-4 px-3 text-sm text-gray-500 text-center">
            Geen factuur templates beschikbaar.<br />
            Voeg templates toe met het label "Factuur".
          </div>
        ) : (
          availableTemplates.map((template) => (
            <SelectItem 
              key={template.id}
              value={template.id} 
              className="py-2 pl-8 pr-12 cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
            >
              <div className="flex items-center gap-2 w-full">
                {template.is_default && (
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                )}
                <span className="text-sm truncate">{template.name}</span>
                <div className="text-xs text-gray-400 ml-auto">
                  {template.labels?.map(l => l.name).join(', ')}
                </div>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};
