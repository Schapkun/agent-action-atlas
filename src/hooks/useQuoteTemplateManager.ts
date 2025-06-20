
import { useState, useEffect } from 'react';
import { useDocumentTemplates } from './useDocumentTemplates';
import { DocumentTemplateWithLabels } from '@/types/documentLabels';

export const useQuoteTemplateManager = () => {
  const { templates, loading: templatesLoading } = useDocumentTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplateWithLabels | null>(null);
  const [availableTemplates, setAvailableTemplates] = useState<DocumentTemplateWithLabels[]>([]);

  useEffect(() => {
    // Filter templates that have "Offerte" label
    const quoteTemplates = templates.filter(template => 
      template.labels?.some(label => label.name.toLowerCase() === 'offerte')
    );
    
    setAvailableTemplates(quoteTemplates);
    
    // Set default template (first available or default marked template)
    const defaultTemplate = quoteTemplates.find(t => t.is_default) || quoteTemplates[0] || null;
    if (defaultTemplate && !selectedTemplate) {
      setSelectedTemplate(defaultTemplate);
    }
  }, [templates, selectedTemplate]);

  const handleTemplateSelect = (template: DocumentTemplateWithLabels | null) => {
    setSelectedTemplate(template);
  };

  return {
    selectedTemplate,
    availableTemplates,
    templatesLoading,
    handleTemplateSelect
  };
};
