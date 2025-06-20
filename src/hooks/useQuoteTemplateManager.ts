
import { useState, useEffect } from 'react';
import { useDocumentTemplates } from './useDocumentTemplates';
import { useDocumentTemplateLabels } from './useDocumentTemplateLabels';
import { DocumentTemplateWithLabels } from '@/types/documentLabels';

export const useQuoteTemplateManager = () => {
  const { templates, loading: templatesLoading } = useDocumentTemplates();
  const { labels, assignLabelToTemplate } = useDocumentTemplateLabels();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplateWithLabels | null>(null);
  const [availableTemplates, setAvailableTemplates] = useState<DocumentTemplateWithLabels[]>([]);

  useEffect(() => {
    console.log('[useQuoteTemplateManager] Processing templates for quotes');
    
    // Filter templates that have "Offerte" label
    const quoteTemplates = templates.filter(template => 
      template.labels?.some(label => label.name.toLowerCase() === 'offerte')
    );
    
    console.log('[useQuoteTemplateManager] Quote templates found:', quoteTemplates.length);
    setAvailableTemplates(quoteTemplates);
    
    // Auto-assign "Offerte" label to "Standaard Factuur Template" if needed
    const standardTemplate = templates.find(t => 
      t.name.toLowerCase().includes('standaard') && 
      t.name.toLowerCase().includes('factuur')
    );
    
    if (standardTemplate) {
      const hasOfferteLabel = standardTemplate.labels?.some(label => 
        label.name.toLowerCase() === 'offerte'
      );
      
      if (!hasOfferteLabel) {
        const offerteLabel = labels.find(label => label.name.toLowerCase() === 'offerte');
        if (offerteLabel) {
          console.log('[useQuoteTemplateManager] Auto-assigning Offerte label to standard template');
          assignLabelToTemplate(standardTemplate.id, offerteLabel.id).catch(console.error);
        }
      }
    }
    
    // Set default template (first available or default marked template)
    const defaultTemplate = quoteTemplates.find(t => t.is_default) || quoteTemplates[0] || null;
    if (defaultTemplate && !selectedTemplate) {
      setSelectedTemplate(defaultTemplate);
    }
  }, [templates, labels, selectedTemplate, assignLabelToTemplate]);

  const handleTemplateSelect = (template: DocumentTemplateWithLabels | null) => {
    setSelectedTemplate(template);
  };

  return {
    selectedTemplate,
    availableTemplates,
    templatesLoading,
    handleTemplateSelect
  };
};
