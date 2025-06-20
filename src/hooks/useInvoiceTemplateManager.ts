
import { useState, useEffect } from 'react';
import { useDocumentTemplates } from './useDocumentTemplates';
import { DocumentTemplateWithTags } from '@/types/documentTags';

export const useInvoiceTemplateManager = () => {
  const { templates: allTemplates, loading: templatesLoading } = useDocumentTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplateWithTags | null>(null);

  // Simple filtering with better performance
  const invoiceTemplates = allTemplates.filter(template => {
    // Check if any tag has the name "Factuur" (case-insensitive)
    return template.tags?.some(tag => tag.toLowerCase() === 'factuur');
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
      }
      
      setSelectedTemplate(defaultTemplate);
    }
  }, [sortedTemplates.length]); // Only depend on length to prevent infinite loops

  const handleTemplateSelect = (template: DocumentTemplateWithTags) => {
    setSelectedTemplate(template);
  };

  return {
    selectedTemplate,
    availableTemplates: sortedTemplates,
    templatesLoading,
    handleTemplateSelect
  };
};
