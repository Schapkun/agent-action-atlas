
import { useState, useEffect } from 'react';
import { useDocumentTemplates } from './useDocumentTemplates';
import { DocumentTemplateWithTags } from '@/types/documentTags';

export const useQuoteTemplates = () => {
  const { templates, loading } = useDocumentTemplates();
  const [quoteTemplates, setQuoteTemplates] = useState<DocumentTemplateWithTags[]>([]);
  const [defaultTemplate, setDefaultTemplate] = useState<DocumentTemplateWithTags | null>(null);
  
  useEffect(() => {
    // Filter templates that have "Offerte" tag
    const offerteTemplates = templates.filter(t => 
      t.tags?.some(tag => tag.toLowerCase() === 'offerte')
    );
    setQuoteTemplates(offerteTemplates);
    
    // Find default template or use first available
    const defaultTpl = offerteTemplates.find(t => t.is_default) || offerteTemplates[0] || null;
    setDefaultTemplate(defaultTpl);
  }, [templates]);

  return {
    quoteTemplates,
    defaultTemplate,
    loading
  };
};
