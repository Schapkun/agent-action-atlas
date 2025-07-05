
import { useState, useEffect } from 'react';
import { useDocumentTemplates } from './useDocumentTemplates';
import { DocumentTemplateWithTags } from '@/types/documentTags';

export const useDocumentTemplateManager = (documentType?: string) => {
  const { templates, loading } = useDocumentTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplateWithTags | null>(null);

  // Filter templates by document type if provided
  const filteredTemplates = documentType 
    ? templates.filter(template => template.type === documentType)
    : templates;

  // Sort templates: favorite first, then by creation date (newest first)
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    if (a.is_default && !b.is_default) return -1;
    if (!a.is_default && b.is_default) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Auto-select first template when templates are loaded
  useEffect(() => {
    if (!loading && sortedTemplates.length > 0 && !selectedTemplate) {
      const defaultTemplate = sortedTemplates.find(t => t.is_default) || sortedTemplates[0];
      setSelectedTemplate(defaultTemplate);
    }
  }, [sortedTemplates.length, loading]);

  const handleTemplateSelect = (template: DocumentTemplateWithTags) => {
    setSelectedTemplate(template);
  };

  return {
    selectedTemplate,
    availableTemplates: sortedTemplates,
    templatesLoading: loading,
    noLabelConfigured: false, // No longer relevant since we removed labels
    handleTemplateSelect
  };
};
