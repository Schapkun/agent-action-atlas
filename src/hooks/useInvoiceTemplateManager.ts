
import { useState, useEffect } from 'react';
import { useDocumentTemplates } from './useDocumentTemplates';
import { DocumentTemplateWithLabels } from '@/types/documentLabels';

export const useInvoiceTemplateManager = () => {
  const { templates: allTemplates, loading: templatesLoading } = useDocumentTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplateWithLabels | null>(null);

  // Filter templates with "Factuur" label (case-insensitive)
  const invoiceTemplates = allTemplates.filter(template => 
    template.labels?.some(label => label.name.toLowerCase() === 'factuur')
  );

  console.log('🎯 TEMPLATE MANAGER: Available templates:', {
    totalTemplates: allTemplates.length,
    allTemplateNames: allTemplates.map(t => t.name),
    allTemplateLabels: allTemplates.map(t => ({
      name: t.name,
      labels: t.labels?.map(l => l.name)
    })),
    filteredInvoiceTemplates: invoiceTemplates.length,
    invoiceTemplateNames: invoiceTemplates.map(t => t.name)
  });

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
      // First try to find a template marked as default
      let defaultTemplate = sortedTemplates.find(t => t.is_default);
      
      // If no default is found, use the newest template (first in sorted array)
      if (!defaultTemplate) {
        defaultTemplate = sortedTemplates[0];
        console.log('🎯 TEMPLATE MANAGER: No default template found, using newest:', defaultTemplate.name);
      } else {
        console.log('🎯 TEMPLATE MANAGER: Using marked default template:', defaultTemplate.name);
      }
      
      setSelectedTemplate(defaultTemplate);
    }
  }, [sortedTemplates, selectedTemplate]);

  const handleTemplateSelect = (templateId: string) => {
    const template = sortedTemplates.find(t => t.id === templateId);
    console.log('🎯 TEMPLATE MANAGER: User selected template:', template?.name);
    setSelectedTemplate(template || null);
  };

  // Clear any old localStorage entries that might conflict
  useEffect(() => {
    // Remove old template system localStorage entries
    localStorage.removeItem('favoriteTemplate');
  }, []);

  console.log('🎯 TEMPLATE MANAGER: Current state (case-insensitive Factuur filtering):', {
    selectedTemplate: selectedTemplate?.name,
    selectedTemplateLabels: selectedTemplate?.labels?.map(l => l.name),
    availableTemplates: sortedTemplates.length,
    loading: templatesLoading,
    filteringBy: 'Factuur label (case-insensitive)',
    templatesFound: sortedTemplates.map(t => ({
      name: t.name,
      isDefault: t.is_default,
      labels: t.labels?.map(l => l.name)
    }))
  });

  return {
    selectedTemplate,
    availableTemplates: sortedTemplates,
    templatesLoading,
    handleTemplateSelect
  };
};
