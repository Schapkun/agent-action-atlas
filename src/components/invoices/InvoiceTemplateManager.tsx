
import React, { useState, useEffect } from 'react';
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
  const [favoriteTemplate, setFavoriteTemplate] = useState<string | null>(null);

  // Load favorite template from localStorage on component mount
  useEffect(() => {
    const savedFavorite = localStorage.getItem('favoriteTemplate');
    console.log('InvoiceTemplateManager - Loading saved favorite:', savedFavorite);
    if (savedFavorite) {
      setFavoriteTemplate(savedFavorite);
    }
  }, []);

  // Auto-select favorite template when available
  useEffect(() => {
    if (favoriteTemplate && documentTemplates.length > 0 && !selectedTemplate) {
      const favoriteTemplateObj = documentTemplates.find(t => t.id === favoriteTemplate);
      if (favoriteTemplateObj) {
        console.log('InvoiceTemplateManager - Auto-selecting favorite template:', favoriteTemplateObj.name);
        setSelectedTemplate(favoriteTemplateObj);
      }
    }
  }, [favoriteTemplate, documentTemplates, selectedTemplate, setSelectedTemplate]);

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

  const handleSetFavorite = (templateId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('InvoiceTemplateManager - Setting favorite to:', templateId);
    setFavoriteTemplate(templateId);
    localStorage.setItem('favoriteTemplate', templateId);
    console.log('InvoiceTemplateManager - Favorite saved to localStorage:', localStorage.getItem('favoriteTemplate'));
    toast({
      title: "Favoriet ingesteld",
      description: "Deze template wordt nu standaard geladen.",
    });
  };

  const getCurrentSelectionLabel = () => {
    if (selectedTemplate) {
      return selectedTemplate.name;
    }
    return templatesLoading ? "Laden..." : "Selecteer template";
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
            {(selectedTemplate?.is_default || favoriteTemplate === selectedTemplate?.id) && (
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
            )}
            <SelectValue>
              {getCurrentSelectionLabel()}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent className="w-64 max-h-80 bg-white border shadow-lg z-50">
          {availableTemplates.map((template) => (
            <div key={template.id} className="relative group">
              <SelectItem 
                value={template.id} 
                className="py-2 pl-8 pr-12 cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
              >
                <div className="flex items-center gap-2 w-full">
                  {(template.is_default || favoriteTemplate === template.id) && (
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  )}
                  <span className="text-sm truncate">{template.name}</span>
                </div>
              </SelectItem>
              <button
                type="button"
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded transition-colors z-[60] ${favoriteTemplate === template.id ? 'text-yellow-500' : 'text-gray-400'}`}
                onClick={(e) => {
                  console.log('InvoiceTemplateManager - Star clicked for template:', template.id);
                  handleSetFavorite(template.id, e);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Star className={`h-3.5 w-3.5 ${favoriteTemplate === template.id ? 'fill-current' : ''}`} />
              </button>
            </div>
          ))}
        </SelectContent>
      </Select>
    )
  };
};
