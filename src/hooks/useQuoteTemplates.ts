
import { useState, useEffect } from 'react';
import { useDocumentTemplates, DocumentTemplate } from './useDocumentTemplates';

export const useQuoteTemplates = () => {
  const { templates, loading } = useDocumentTemplates();
  const [quoteTemplates, setQuoteTemplates] = useState<DocumentTemplate[]>([]);
  const [defaultTemplate, setDefaultTemplate] = useState<DocumentTemplate | null>(null);
  
  useEffect(() => {
    // Filter templates that have "Offerte" label
    const offerteTemplates = templates.filter(t => 
      t.labels?.some(label => label.name.toLowerCase() === 'offerte')
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
