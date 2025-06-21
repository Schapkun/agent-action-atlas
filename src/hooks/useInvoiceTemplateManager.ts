
import { useState, useEffect } from 'react';
import { useDocumentTemplates } from './useDocumentTemplates';
import { useDocumentTemplatesWithLabels } from './useDocumentTemplatesWithLabels';
import { useInvoiceSettingsDefaults } from './useInvoiceSettingsDefaults';
import { DocumentTemplateWithTags } from '@/types/documentTags';

export const useInvoiceTemplateManager = () => {
  const { templates: allTemplates, loading: templatesLoading } = useDocumentTemplates();
  const { templates: templatesWithLabels, loading: labelsLoading } = useDocumentTemplatesWithLabels();
  const { defaultInvoiceLabel, loading: defaultsLoading } = useInvoiceSettingsDefaults();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplateWithTags | null>(null);

  // Filter templates by default label if one is set in settings
  const getFilteredTemplates = () => {
    if (!defaultInvoiceLabel) {
      // If no default label is set, return empty array to show "no label configured" message
      console.log('⚠️ Geen default invoice label ingesteld in instellingen');
      return [];
    }

    // Get template IDs that have the default label
    const templateIdsWithLabel = templatesWithLabels
      .filter(template => template.labels?.some(label => label.id === defaultInvoiceLabel.id))
      .map(template => template.id);

    // Filter all templates to only include those with the default label
    const filtered = allTemplates.filter(template => templateIdsWithLabel.includes(template.id));
    
    console.log('🏷️ Default invoice label:', defaultInvoiceLabel.name);
    console.log('🏷️ Templates with label:', templateIdsWithLabel.length);
    console.log('🏷️ Filtered invoice templates:', filtered.length);
    
    return filtered;
  };

  const filteredTemplates = getFilteredTemplates();
  const noLabelConfigured = !defaultInvoiceLabel;

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
          console.log('🎯 Auto-selected template:', defaultTemplate?.name);
        }
      } else {
        setSelectedTemplate(null);
        if (noLabelConfigured) {
          console.log('⚠️ Geen label geconfigureerd in instellingen');
        } else {
          console.log('⚠️ No templates available for selected label');
        }
      }
    }
  }, [sortedTemplates.length, defaultInvoiceLabel?.id, templatesLoading, labelsLoading, defaultsLoading, noLabelConfigured]);

  const handleTemplateSelect = (template: DocumentTemplateWithTags) => {
    setSelectedTemplate(template);
    console.log('✅ Template selected:', template.name);
  };

  return {
    selectedTemplate,
    selectedLabel: defaultInvoiceLabel,
    availableTemplates: sortedTemplates,
    templatesLoading: templatesLoading || labelsLoading || defaultsLoading,
    noLabelConfigured,
    handleTemplateSelect,
    // Keep these for backward compatibility but they won't be used
    handleLabelSelect: () => {}
  };
};
