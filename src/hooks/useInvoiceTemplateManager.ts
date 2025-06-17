
import { useState, useEffect } from 'react';
import { useDocumentTemplates } from './useDocumentTemplates';
import { DocumentTemplateWithLabels } from '@/types/documentLabels';

export const useInvoiceTemplateManager = () => {
  const { templates: allTemplates, loading: templatesLoading } = useDocumentTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplateWithLabels | null>(null);

  // Filter templates with "Factuur" label
  const invoiceTemplates = allTemplates.filter(template => 
    template.labels?.some(label => label.name.toLowerCase() === 'factuur')
  );

  // Sort templates: favorite first, then by creation date
  const sortedTemplates = [...invoiceTemplates].sort((a, b) => {
    if (a.is_default && !b.is_default) return -1;
    if (!a.is_default && b.is_default) return 1;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  // Auto-select default template when available
  useEffect(() => {
    if (sortedTemplates.length > 0 && !selectedTemplate) {
      const defaultTemplate = sortedTemplates.find(t => t.is_default) || sortedTemplates[0];
      console.log('🎯 CENTRAAL: Auto-selecting template:', defaultTemplate.name);
      setSelectedTemplate(defaultTemplate);
    }
  }, [sortedTemplates, selectedTemplate]);

  const handleTemplateSelect = (templateId: string) => {
    const template = sortedTemplates.find(t => t.id === templateId);
    console.log('🎯 CENTRAAL: User selected template:', template?.name);
    setSelectedTemplate(template || null);
  };

  console.log('🎯 CENTRAAL: Current state:', {
    selectedTemplate: selectedTemplate?.name,
    availableTemplates: sortedTemplates.length,
    loading: templatesLoading
  });

  return {
    selectedTemplate,
    availableTemplates: sortedTemplates,
    templatesLoading,
    handleTemplateSelect
  };
};
