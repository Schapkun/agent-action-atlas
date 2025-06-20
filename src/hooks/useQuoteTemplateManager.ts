
import { useState, useEffect } from 'react';
import { useDocumentTemplates } from './useDocumentTemplates';
import { DocumentTemplateWithTags } from '@/types/documentTags';

export const useQuoteTemplateManager = () => {
  const { templates, loading: templatesLoading } = useDocumentTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplateWithTags | null>(null);
  const [availableTemplates, setAvailableTemplates] = useState<DocumentTemplateWithTags[]>([]);

  useEffect(() => {
    // Filter templates that have "Offerte" tag
    const quoteTemplates = templates.filter(template => 
      template.tags?.some(tag => tag.toLowerCase() === 'offerte')
    );
    
    setAvailableTemplates(quoteTemplates);
    
    // Set default template (first available or default marked template)
    const defaultTemplate = quoteTemplates.find(t => t.is_default) || quoteTemplates[0] || null;
    if (defaultTemplate && !selectedTemplate) {
      setSelectedTemplate(defaultTemplate);
    }
  }, [templates.length]); // Only depend on length to prevent infinite loops

  const handleTemplateSelect = (template: DocumentTemplateWithTags | null) => {
    setSelectedTemplate(template);
  };

  return {
    selectedTemplate,
    availableTemplates,
    templatesLoading,
    handleTemplateSelect
  };
};
