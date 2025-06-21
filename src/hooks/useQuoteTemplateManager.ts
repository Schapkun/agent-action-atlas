
import { useState, useEffect } from 'react';
import { useDocumentTemplates } from './useDocumentTemplates';
import { useDocumentTemplatesWithLabels } from './useDocumentTemplatesWithLabels';
import { DocumentTemplateWithTags } from '@/types/documentTags';
import { DocumentTemplateWithLabels, DocumentTemplateLabel } from '@/types/documentTemplateLabels';

export const useQuoteTemplateManager = () => {
  const { templates: allTemplates, loading: templatesLoading } = useDocumentTemplates();
  const { templates: templatesWithLabels, loading: labelsLoading } = useDocumentTemplatesWithLabels();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplateWithTags | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<DocumentTemplateLabel | null>(null);

  // Filter templates by "Offerte" tag
  const quoteTemplates = allTemplates.filter(template => 
    template.tags?.some(tag => tag.toLowerCase() === 'offerte')
  );

  // Filter templates by selected label if one is chosen
  const getFilteredTemplates = () => {
    if (!selectedLabel) {
      return quoteTemplates;
    }

    // Get template IDs that have the selected label
    const templateIdsWithLabel = templatesWithLabels
      .filter(template => template.labels?.some(label => label.id === selectedLabel.id))
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
  }, [sortedTemplates.length, selectedLabel?.id]);

  const handleTemplateSelect = (template: DocumentTemplateWithTags | null) => {
    setSelectedTemplate(template);
  };

  const handleLabelSelect = (label: DocumentTemplateLabel | null) => {
    setSelectedLabel(label);
  };

  return {
    selectedTemplate,
    selectedLabel,
    availableTemplates: sortedTemplates,
    templatesLoading: templatesLoading || labelsLoading,
    handleTemplateSelect,
    handleLabelSelect
  };
};
