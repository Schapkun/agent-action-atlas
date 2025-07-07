import { useState, useEffect } from 'react';
import { useDocumentTemplates } from './useDocumentTemplates';
import { DocumentTemplateWithTags } from '@/types/documentTags';

export const useQuoteTemplateManager = () => {
  const { templates: allTemplates, loading: templatesLoading } = useDocumentTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplateWithTags | null>(null);

  // Since we removed the label system, we'll filter by template type instead
  const quoteTemplates = allTemplates.filter(template => 
    template.type === 'quote' || template.name.toLowerCase().includes('offerte')
  );

  // Sort templates: favorite first, then by creation date (newest first)
  const sortedTemplates = [...quoteTemplates].sort((a, b) => {
    if (a.is_default && !b.is_default) return -1;
    if (!a.is_default && b.is_default) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Auto-select template when filtered templates change
  useEffect(() => {
    if (!templatesLoading) {
      if (sortedTemplates.length > 0) {
        // If current selection is not in filtered list, select first available
        if (!selectedTemplate || !sortedTemplates.find(t => t.id === selectedTemplate.id)) {
          const defaultTemplate = sortedTemplates.find(t => t.is_default) || sortedTemplates[0];
          setSelectedTemplate(defaultTemplate);
          console.log('🎯 Auto-selected quote template:', defaultTemplate?.name);
        }
      } else {
        setSelectedTemplate(null);
        console.log('⚠️ No quote templates available');
      }
    }
  }, [sortedTemplates.length, templatesLoading]);

  const handleTemplateSelect = (template: DocumentTemplateWithTags | null) => {
    setSelectedTemplate(template);
    if (template) {
      console.log('✅ Quote template selected:', template.name);
    }
  };

  return {
    selectedTemplate,
    selectedLabel: null, // No longer used
    availableTemplates: sortedTemplates,
    templatesLoading,
    noLabelConfigured: false, // No longer relevant
    handleTemplateSelect,
    // Keep these for backward compatibility but they won't be used
    handleLabelSelect: () => {}
  };
};
