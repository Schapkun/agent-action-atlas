
import { useState, useEffect } from 'react';
import { useDocumentTemplates } from './useDocumentTemplates';
import { DocumentTemplateWithLabels } from '@/types/documentLabels';

export const useInvoiceTemplateManager = () => {
  const { templates: allTemplates, loading: templatesLoading } = useDocumentTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplateWithLabels | null>(null);

  // Filter templates ONLY with "Factuur" label (no more type filtering)
  const invoiceTemplates = allTemplates.filter(template => 
    template.labels?.some(label => label.name.toLowerCase() === 'factuur')
  );

  // Sort templates: favorite first, then by creation date (NEWEST FIRST)
  const sortedTemplates = [...invoiceTemplates].sort((a, b) => {
    if (a.is_default && !b.is_default) return -1;
    if (!a.is_default && b.is_default) return 1;
    // Newest first for better UX
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Auto-select default template when available, fallback to newest
  useEffect(() => {
    if (sortedTemplates.length > 0 && !selectedTemplate) {
      const defaultTemplate = sortedTemplates.find(t => t.is_default) || sortedTemplates[0];
      console.log('🎯 CENTRAAL: Auto-selecting template (label-based only):', defaultTemplate.name);
      setSelectedTemplate(defaultTemplate);
    }
  }, [sortedTemplates, selectedTemplate]);

  const handleTemplateSelect = (templateId: string) => {
    const template = sortedTemplates.find(t => t.id === templateId);
    console.log('🎯 CENTRAAL: User selected template:', template?.name);
    setSelectedTemplate(template || null);
  };

  // Clear any old localStorage entries that might conflict
  useEffect(() => {
    // Remove old template system localStorage entries
    localStorage.removeItem('favoriteTemplate');
  }, []);

  console.log('🎯 CENTRAAL: Current state (label-based filtering only):', {
    selectedTemplate: selectedTemplate?.name,
    availableTemplates: sortedTemplates.length,
    loading: templatesLoading,
    filteringBy: 'Factuur label only',
    templatesFound: sortedTemplates.map(t => t.name)
  });

  return {
    selectedTemplate,
    availableTemplates: sortedTemplates,
    templatesLoading,
    handleTemplateSelect
  };
};
