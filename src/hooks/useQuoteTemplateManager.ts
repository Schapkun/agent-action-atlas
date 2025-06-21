
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

  // Filter templates by "Offerte" tag first
  const quoteTemplates = allTemplates.filter(template => 
    template.tags?.some(tag => tag.toLowerCase() === 'offerte')
  );

  // Filter templates by default label if one is set in settings
  const getFilteredTemplates = () => {
    if (!defaultQuoteLabel) {
      // If no default label is set, return all quote templates
      return quoteTemplates;
    }

    // Get template IDs that have the default label
    const templateIdsWithLabel = templatesWithLabels
      .filter(template => template.labels?.some(label => label.id === defaultQuoteLabel.id))
      .map(template => template.id);

    // Filter quote templates to only include those with the default label
    const filtered = quoteTemplates.filter(template => templateIdsWithLabel.includes(template.id));
    
    console.log('🏷️ Default quote label:', defaultQuoteLabel.name);
    console.log('🏷️ Templates with label:', templateIdsWithLabel.length);
    console.log('🏷️ Filtered quote templates:', filtered.length);
    
    return filtered;
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
    if (!templatesLoading && !labelsLoading && !defaultsLoading) {
      if (sortedTemplates.length > 0) {
        // If current selection is not in filtered list, select first available
        if (!selectedTemplate || !sortedTemplates.find(t => t.id === selectedTemplate.id)) {
          const defaultTemplate = sortedTemplates.find(t => t.is_default) || sortedTemplates[0];
          setSelectedTemplate(defaultTemplate);
          console.log('🎯 Auto-selected quote template:', defaultTemplate?.name);
        }
      } else {
        setSelectedTemplate(null);
        console.log('⚠️ No quote templates available for selected label');
      }
    }
  }, [sortedTemplates.length, defaultQuoteLabel?.id, templatesLoading, labelsLoading, defaultsLoading]);

  const handleTemplateSelect = (template: DocumentTemplateWithTags | null) => {
    setSelectedTemplate(template);
    if (template) {
      console.log('✅ Quote template selected:', template.name);
    }
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
