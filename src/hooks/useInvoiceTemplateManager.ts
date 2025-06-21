import { useState, useEffect } from 'react';
import { useDocumentTemplates } from './useDocumentTemplates';
import { DocumentTemplateWithTags } from '@/types/documentTags';

export const useInvoiceTemplateManager = () => {
  const { templates: allTemplates, loading: templatesLoading } = useDocumentTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplateWithTags | null>(null);

  // Since we removed the label system, we'll filter by template type instead
  const invoiceTemplates = allTemplates.filter(template => 
    template.type === 'invoice' || template.name.toLowerCase().includes('factuur')
  );

  // Sort templates: favorite first, then by creation date (newest first)
  const sortedTemplates = [...invoiceTemplates].sort((a, b) => {
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
          console.log('🎯 Auto-selected invoice template:', defaultTemplate?.name);
        }
      } else {
        setSelectedTemplate(null);
        console.log('⚠️ No invoice templates available');
      }
    }
  }, [sortedTemplates.length, templatesLoading]);

  const handleTemplateSelect = (template: DocumentTemplateWithTags) => {
    setSelectedTemplate(template);
    console.log('✅ Invoice template selected:', template.name);
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
