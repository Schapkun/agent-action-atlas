
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { DocumentTemplateWithLabels } from '@/types/documentLabels';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';
import { useToast } from '@/hooks/use-toast';

interface InvoiceTemplateManagerProps {
  documentTemplates: DocumentTemplateWithLabels[];
  templatesLoading: boolean;
  selectedTemplate: DocumentTemplateWithLabels | null;
  setSelectedTemplate: (template: DocumentTemplateWithLabels | null) => void;
}

export const InvoiceTemplateManager = ({
  documentTemplates,
  templatesLoading,
  selectedTemplate,
  setSelectedTemplate
}: InvoiceTemplateManagerProps) => {
  const { setTemplateFavorite } = useDocumentTemplates();
  const { toast } = useToast();

  // Filter templates that have "Factuur" label and sort them
  const availableTemplates = documentTemplates
    .filter(template => 
      template.labels?.some(label => label.name.toLowerCase() === 'factuur')
    )
    .sort((a, b) => {
      // Favorite templates first
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      
      // Then by creation date (oldest first)
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

  const handleTemplateChange = (templateId: string) => {
    const template = availableTemplates.find(t => t.id === templateId);
    setSelectedTemplate(template || null);
  };

  const handleToggleFavorite = async (template: DocumentTemplateWithLabels, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await setTemplateFavorite(template.id, !template.is_default);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return {
    availableTemplates,
    templateSelect: (
      <div className="flex items-center gap-2">
        <Select
          value={selectedTemplate?.id || ''}
          onValueChange={handleTemplateChange}
          disabled={templatesLoading}
        >
          <SelectTrigger className="h-8 text-xs flex-1">
            <SelectValue placeholder={templatesLoading ? "Laden..." : "Selecteer template"} />
          </SelectTrigger>
          <SelectContent>
            {availableTemplates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                <div className="flex items-center gap-2 w-full">
                  {template.is_default && (
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  )}
                  <span>{template.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedTemplate && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => handleToggleFavorite(selectedTemplate, e)}
            title={selectedTemplate.is_default ? "Favoriet verwijderen" : "Als favoriet instellen"}
          >
            <Star 
              className={`h-4 w-4 ${
                selectedTemplate.is_default 
                  ? 'text-yellow-500 fill-current' 
                  : 'text-gray-400 hover:text-yellow-500'
              }`} 
            />
          </Button>
        )}
      </div>
    )
  };
};
