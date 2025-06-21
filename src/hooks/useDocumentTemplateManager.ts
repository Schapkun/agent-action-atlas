
import { useState, useEffect } from 'react';
import { useDocumentTemplates } from './useDocumentTemplates';
import { useDocumentTemplatesWithLabels } from './useDocumentTemplatesWithLabels';
import { useDocumentSettingsDefaults } from './useDocumentSettingsDefaults';
import { DocumentTemplateWithTags } from '@/types/documentTags';

export const useDocumentTemplateManager = (documentType?: string) => {
  const { templates: allTemplates, loading: templatesLoading } = useDocumentTemplates();
  const { templates: templatesWithLabels, loading: labelsLoading } = useDocumentTemplatesWithLabels();
  const { getDefaultLabelForType, loading: defaultsLoading } = useDocumentSettingsDefaults();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplateWithTags | null>(null);

  // Get the default label for the specified document type
  const defaultLabel = documentType ? getDefaultLabelForType(documentType) : null;

  // Filter templates by default label if one is set in settings
  const getFilteredTemplates = () => {
    if (!defaultLabel || !documentType) {
      console.log('⚠️ Geen default label ingesteld voor document type:', documentType);
      return [];
    }

    // Get template IDs that have the default label
    const templateIdsWithLabel = templatesWithLabels
      .filter(template => template.labels?.some(label => label.id === defaultLabel.id))
      .map(template => template.id);

    // Filter all templates to only include those with the default label
    const filtered = allTemplates.filter(template => templateIdsWithLabel.includes(template.id));
    
    console.log('🏷️ Default label for', documentType, ':', defaultLabel.name);
    console.log('🏷️ Templates with label:', templateIdsWithLabel.length);
    console.log('🏷️ Filtered templates:', filtered.length);
    
    return filtered;
  };

  const filteredTemplates = getFilteredTemplates();
  const noLabelConfigured = !defaultLabel || !documentType;

  // Sort templates: favorite first, then by creation date (newest first)
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    if (a.is_default && !b.is_default) return -1;
    if (!a.is_default && b.is_default) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Auto-select template when filtered templates change
  useEffect(() => {
    if (!templatesLoading && !labelsLoading && !defaultsLoading && documentType) {
      if (sortedTemplates.length > 0) {
        // If current selection is not in filtered list, select first available
        if (!selectedTemplate || !sortedTemplates.find(t => t.id === selectedTemplate.id)) {
          const defaultTemplate = sortedTemplates.find(t => t.is_default) || sortedTemplates[0];
          setSelectedTemplate(defaultTemplate);
          console.log('🎯 Auto-selected template for', documentType, ':', defaultTemplate?.name);
        }
      } else {
        setSelectedTemplate(null);
        if (noLabelConfigured) {
          console.log('⚠️ Geen label geconfigureerd voor document type:', documentType);
        } else {
          console.log('⚠️ No templates available for document type:', documentType);
        }
      }
    }
  }, [sortedTemplates.length, defaultLabel?.id, documentType, templatesLoading, labelsLoading, defaultsLoading, noLabelConfigured]);

  const handleTemplateSelect = (template: DocumentTemplateWithTags) => {
    setSelectedTemplate(template);
    console.log('✅ Template selected for', documentType, ':', template.name);
  };

  return {
    selectedTemplate,
    selectedLabel: defaultLabel,
    availableTemplates: sortedTemplates,
    templatesLoading: templatesLoading || labelsLoading || defaultsLoading,
    noLabelConfigured,
    handleTemplateSelect
  };
};
