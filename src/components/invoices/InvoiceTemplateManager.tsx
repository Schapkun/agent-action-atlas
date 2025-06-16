
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
      <Select
        value={selectedTemplate?.id || ''}
        onValueChange={handleTemplateChange}
        disabled={templatesLoading}
      >
        <SelectTrigger className="h-8 text-xs flex-1">
          <div className="flex items-center gap-2">
            {selectedTemplate?.is_default && (
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
            )}
            <SelectValue placeholder={templatesLoading ? "Laden..." : "Selecteer template"} />
          </div>
        </SelectTrigger>
        <SelectContent>
          {availableTemplates.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              <div className="flex items-center justify-between w-full group">
                <div className="flex items-center gap-2">
                  {template.is_default && (
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  )}
                  <span>{template.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleToggleFavorite(template, e)}
                  title={template.is_default ? "Favoriet verwijderen" : "Als favoriet instellen"}
                >
                  <Star 
                    className={`h-3 w-3 ${
                      template.is_default 
                        ? 'text-yellow-500 fill-current' 
                        : 'text-gray-400 hover:text-yellow-500'
                    }`} 
                  />
                </Button>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  };
};
