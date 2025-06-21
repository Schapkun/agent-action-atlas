import { useState, useEffect } from 'react';
import { useDocumentTemplates } from './useDocumentTemplates';
import { useDocumentTemplatesWithLabels } from './useDocumentTemplatesWithLabels';
import { useInvoiceSettingsDefaults } from './useInvoiceSettingsDefaults';
import { DocumentTemplateWithTags } from '@/types/documentTags';

export const useQuoteTemplateManager = () => {
  const { templates: allTemplates, loading: templatesLoading } = useDocumentTemplates();
  const { templates: templatesWithLabels, loading: labelsLoading } = useDocumentTemplatesWithLabels();
  const { defaultQuoteLabel, loading: defaultsLoading } = useInvoiceSettingsDefaults();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplateWithTags | null>(null);

  // Filter templates by "Offerte" tag
  const quoteTemplates = allTemplates.filter(template => 
    template.tags?.some(tag => tag.toLowerCase() === 'offerte')
  );

  // Filter templates by default label if one is set in settings
  const getFilteredTemplates = () => {
    if (!defaultQuoteLabel) {
      return quoteTemplates;
    }

    // Get template IDs that have the default label
    const templateIdsWithLabel = templatesWithLabels
      .filter(template => template.labels?.some(label => label.id === defaultQuoteLabel.id))
      .map(template => template.id);

    return quoteTemplates.filter(template => templateIdsWithLabel.includes(template.id));
  };

  const filteredTemplates = getFilteredTemplates();

  // Sort templates: favorite first, then by creation date (newest first)
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    if (a.is_default && !b.is_default) return -1;
    if (!a.is_default && b.is_default) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Auto-select template when filtered templates change
  useEffect(() => {
    if (sortedTemplates.length > 0) {
      // If current selection is not in filtered list, select first available
      if (!selectedTemplate || !sortedTemplates.find(t => t.id === selectedTemplate.id)) {
        const defaultTemplate = sortedTemplates.find(t => t.is_default) || sortedTemplates[0];
        setSelectedTemplate(defaultTemplate);
      }
    } else if (sortedTemplates.length === 0) {
      setSelectedTemplate(null);
    }
  }, [sortedTemplates.length, defaultQuoteLabel?.id]);

  const handleTemplateSelect = (template: DocumentTemplateWithTags | null) => {
    setSelectedTemplate(template);
  };

  return {
    selectedTemplate,
    selectedLabel: defaultQuoteLabel,
    availableTemplates: sortedTemplates,
    templatesLoading: templatesLoading || labelsLoading || defaultsLoading,
    handleTemplateSelect,
    // Keep these for backward compatibility but they won't be used
    handleLabelSelect: () => {}
  };
};
